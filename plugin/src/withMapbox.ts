import { promises } from 'fs';
import path from 'path';

import {
  ConfigPlugin,
  createRunOncePlugin,
  withDangerousMod,
  withXcodeProject,
  XcodeProject,
  withGradleProperties,
  WarningAggregator,
  withProjectBuildGradle,
  withAppBuildGradle,
} from '@expo/config-plugins';
import {
  mergeContents,
  removeGeneratedContents,
} from '@expo/config-plugins/build/utils/generateCode';

let pkg: { name: string; version?: string } = {
  name: '@rnmapbox/maps',
};
try {
  pkg = require('@rnmapbox/maps/package.json');
} catch {
  // empty catch block
}

type InstallerBlockName = 'pre' | 'post';

export type MapboxPlugProps = {
  RNMapboxMapsImpl?: string;
  RNMapboxMapsDownloadToken?: string;
};

/**
 * Dangerously adds the custom installer hooks to the Podfile.
 * In the future this should be removed in favor of some custom hooks provided by Expo autolinking.
 *
 * https://github.com/rnmapbox/maps/blob/main/ios/install.md#react-native--0600
 * @param config
 * @returns
 */
const withCocoaPodsInstallerBlocks: ConfigPlugin<MapboxPlugProps> = (
  c,
  { RNMapboxMapsImpl, RNMapboxMapsDownloadToken },
) => {
  return withDangerousMod(c, [
    'ios',
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      const contents = await promises.readFile(file, 'utf8');

      await promises.writeFile(
        file,
        applyCocoaPodsModifications(contents, {
          RNMapboxMapsImpl,
          RNMapboxMapsDownloadToken,
        }),
        'utf-8',
      );
      return config;
    },
  ]);
};

// Only the preinstaller block is required, the post installer block is
// used for spm (swift package manager) which Expo doesn't currently support.
export function applyCocoaPodsModifications(
  contents: string,
  { RNMapboxMapsImpl, RNMapboxMapsDownloadToken }: MapboxPlugProps,
): string {
  // Ensure installer blocks exist
  let src = addConstantBlock(
    contents,
    RNMapboxMapsImpl,
    RNMapboxMapsDownloadToken,
  );
  src = addInstallerBlock(src, 'pre');
  src = addInstallerBlock(src, 'post');
  src = addMapboxInstallerBlock(src, 'pre');
  src = addMapboxInstallerBlock(src, 'post');
  return src;
}

export function addConstantBlock(
  src: string,
  RNMapboxMapsImpl?: string,
  RNMapboxMapsDownloadToken?: string,
): string {
  const tag = `@rnmapbox/maps-rnmapboxmapsimpl`;

  if (RNMapboxMapsImpl == null) {
    const modified = removeGeneratedContents(src, tag);
    if (!modified) {
      return src;
    } else {
      return modified;
    }
  }

  return mergeContents({
    tag,
    src,
    newSrc: [
      `$RNMapboxMapsImpl = '${RNMapboxMapsImpl}'`,
      `$RNMapboxMapsDownloadToken = '${RNMapboxMapsDownloadToken}'`,
    ].join('\n'),
    anchor: /target .+ do/,
    // We can't go after the use_react_native block because it might have parameters, causing it to be multi-line (see react-native template).
    offset: 0,
    comment: '#',
  }).contents;
}

export function addInstallerBlock(
  src: string,
  blockName: InstallerBlockName,
): string {
  const matchBlock = new RegExp(`${blockName}_install do \\|installer\\|`);
  const tag = `${blockName}_installer`;
  for (const line of src.split('\n')) {
    const contents = line.trim();
    // Ignore comments
    if (!contents.startsWith('#')) {
      // Prevent adding the block if it exists outside of comments.
      if (contents.match(matchBlock)) {
        // This helps to still allow revisions, since we enabled the block previously.
        // Only continue if the generated block exists...
        const modified = removeGeneratedContents(src, tag);
        if (!modified) {
          return src;
        }
      }
    }
  }

  return mergeContents({
    tag,
    src,
    newSrc: [`  ${blockName}_install do |installer|`, '  end'].join('\n'),
    anchor: /use_react_native/,
    // We can't go after the use_react_native block because it might have parameters, causing it to be multi-line (see react-native template).
    offset: 0,
    comment: '#',
  }).contents;
}

export function addMapboxInstallerBlock(
  src: string,
  blockName: InstallerBlockName,
): string {
  return mergeContents({
    tag: `@rnmapbox/maps-${blockName}_installer`,
    src,
    newSrc: `    $RNMapboxMaps.${blockName}_install(installer)`,
    anchor: new RegExp(`^\\s*${blockName}_install do \\|installer\\|`),
    offset: 1,
    comment: '#',
  }).contents;
}

/**
 * Exclude building for arm64 on simulator devices in the pbxproj project.
 * Without this, production builds targeting simulators will fail.
 */
export function setExcludedArchitectures(project: XcodeProject): XcodeProject {
  const configurations = project.pbxXCBuildConfigurationSection();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  for (const { buildSettings } of Object.values(configurations || {})) {
    // Guessing that this is the best way to emulate Xcode.
    // Using `project.addToBuildSettings` modifies too many targets.
    if (typeof buildSettings?.PRODUCT_NAME !== 'undefined') {
      buildSettings['"EXCLUDED_ARCHS[sdk=iphonesimulator*]"'] = '"arm64"';
    }
  }

  return project;
}

const withExcludedSimulatorArchitectures: ConfigPlugin = (c) => {
  return withXcodeProject(c, (config) => {
    config.modResults = setExcludedArchitectures(config.modResults);
    return config;
  });
};

const withAndroidPropertiesDownloadToken: ConfigPlugin<MapboxPlugProps> = (
  config,
  { RNMapboxMapsDownloadToken },
) => {
  const key = 'MAPBOX_DOWNLOADS_TOKEN';
  if (RNMapboxMapsDownloadToken) {
    return withGradleProperties(config, (config) => {
      config.modResults = config.modResults.filter((item) => {
        if (item.type === 'property' && item.key === key) {
          return false;
        }
        return true;
      });
      config.modResults.push({
        type: 'property',
        key,
        value: RNMapboxMapsDownloadToken,
      });

      return config;
    });
  } else {
    return config;
  }
};

const withAndroidPropertiesImpl2: ConfigPlugin<MapboxPlugProps> = (
  config,
  { RNMapboxMapsImpl },
) => {
  const key = 'expoRNMapboxMapsImpl';
  if (RNMapboxMapsImpl) {
    return withGradleProperties(config, (config) => {
      config.modResults = config.modResults.filter((item) => {
        if (item.type === 'property' && item.key === key) {
          return false;
        }
        return true;
      });
      config.modResults.push({
        type: 'property',
        key: key,
        value: RNMapboxMapsImpl,
      });

      return config;
    });
  } else {
    return config;
  }
};

const withAndroidProperties: ConfigPlugin<MapboxPlugProps> = (
  config,
  { RNMapboxMapsImpl, RNMapboxMapsDownloadToken },
) => {
  config = withAndroidPropertiesDownloadToken(config, {
    RNMapboxMapsDownloadToken,
  });
  config = withAndroidPropertiesImpl2(config, { RNMapboxMapsImpl });
  return config;
};

const addLibCppFilter = (appBuildGradle: string): string => {
  if (appBuildGradle.includes("pickFirst 'lib/x86/libc++_shared.so'"))
    return appBuildGradle;
  return mergeContents({
    tag: `@rnmapbox/maps-libcpp`,
    src: appBuildGradle,
    newSrc: `packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
    }`,
    anchor: new RegExp(`^\\s*android\\s*{`),
    offset: 1,
    comment: '//',
  }).contents;
};

const addMapboxMavenRepo = (projectBuildGradle: string): string => {
  if (projectBuildGradle.includes('api.mapbox.com/downloads/v2/releases/maven'))
    return projectBuildGradle;

  /*
  Should look like this:
  
  allprojects {
    configurations.all {
        resolutionStrategy {
            force \\"com.facebook.react:react-native:\\" + REACT_NATIVE_VERSION
        }
    }

    repositories {
        maven {
          url 'https://api.mapbox.com/downloads/v2/releases/maven'
          authentication { basic(BasicAuthentication) }
          credentials {
            username = 'mapbox'
            password = project.properties['MAPBOX_DOWNLOADS_TOKEN'] ?: \\"\\"
          }
        }
        mavenLocal()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url(new File(['node', '--print', \\"require.resolve('react-native/package.json')\\"].execute(null, rootDir).text.trim(), '../android'))
        }
        // ...
  */

  /*
    Since mergeContents checks the anchor for each line, we can't do a "correct"
    RegExp for allprojects...repositories.
    Instead, we check for the first line of `mavenLocal` or `allprojects`, and then insert the block after some content inspection.
  */
  let offset = 1;
  let anchor: RegExp;
  const allProjectsPattern = new RegExp(`^\\s*allprojects\\s*{`, 'gm');
  const mavenLocalPattern = new RegExp(`^\\s*mavenLocal\\(\\)`, 'gm');
  const mavenLocalMatch = projectBuildGradle.match(mavenLocalPattern);
  if (mavenLocalMatch) {
    mavenLocalPattern.lastIndex = 0;
    anchor = mavenLocalPattern;
    offset = 1;
  } else {
    // hack to count offset
    const allProjectSplit = projectBuildGradle.split(allProjectsPattern);
    const allProjectLines =
      allProjectSplit[allProjectSplit.length - 1].split('\n');
    const allProjectReposOffset = allProjectLines.findIndex((line) =>
      line.includes('repositories'),
    );
    allProjectsPattern.lastIndex = 0;
    anchor = allProjectsPattern;
    offset = allProjectReposOffset + 1;
  }

  return mergeContents({
    tag: `@rnmapbox/maps-v2-maven`,
    src: projectBuildGradle,
    newSrc: `
        maven {
          url 'https://api.mapbox.com/downloads/v2/releases/maven'
          authentication { basic(BasicAuthentication) }
          credentials {
            username = 'mapbox'
            password = project.properties['MAPBOX_DOWNLOADS_TOKEN'] ?: ""
          }
        }\n`,
    anchor,
    offset,
    comment: '//',
  }).contents;
};

const withAndroidAppGradle: ConfigPlugin<MapboxPlugProps> = (config) => {
  return withAppBuildGradle(config, ({ modResults, ...config }) => {
    if (modResults.language !== 'groovy') {
      WarningAggregator.addWarningAndroid(
        'withMapbox',
        `Cannot automatically configure app build.gradle if it's not groovy`,
      );
      return { modResults, ...config };
    }

    modResults.contents = addLibCppFilter(modResults.contents);
    return { modResults, ...config };
  });
};

const withAndroidProjectGradle: ConfigPlugin<MapboxPlugProps> = (config) => {
  return withProjectBuildGradle(config, ({ modResults, ...config }) => {
    if (modResults.language !== 'groovy') {
      WarningAggregator.addWarningAndroid(
        'withMapbox',
        `Cannot automatically configure app build.gradle if it's not groovy`,
      );
      return { modResults, ...config };
    }

    modResults.contents = addMapboxMavenRepo(modResults.contents);
    return { modResults, ...config };
  });
};

const withMapboxAndroid: ConfigPlugin<MapboxPlugProps> = (
  config,
  { RNMapboxMapsImpl, RNMapboxMapsDownloadToken },
) => {
  config = withAndroidProperties(config, {
    RNMapboxMapsImpl,
    RNMapboxMapsDownloadToken,
  });
  config = withAndroidProjectGradle(config, { RNMapboxMapsImpl });
  config = withAndroidAppGradle(config, { RNMapboxMapsImpl });
  return config;
};

const withMapbox: ConfigPlugin<MapboxPlugProps> = (
  config,
  { RNMapboxMapsImpl, RNMapboxMapsDownloadToken },
) => {
  config = withExcludedSimulatorArchitectures(config);
  config = withMapboxAndroid(config, {
    RNMapboxMapsImpl,
    RNMapboxMapsDownloadToken,
  });
  return withCocoaPodsInstallerBlocks(config, {
    RNMapboxMapsImpl,
    RNMapboxMapsDownloadToken,
  });
};

export default createRunOncePlugin(withMapbox, pkg.name, pkg.version);

// TODO: export internal functions for testing purposes
export {
  // the following methods accept a string and return a string
  addMapboxMavenRepo as _addMapboxMavenRepo,
  // addLibCppFilter as _addLibCppFilter,
  // Following methods accept a config object
  // withAndroidProperties as _withAndroidProperties,
  // withAndroidPropertiesDownloadToken as _withAndroidPropertiesDownloadToken,
  // withAndroidPropertiesImpl2 as _withAndroidPropertiesImpl2,
  // withAndroidAppGradle as _withAndroidAppGradle,
  // withAndroidProjectGradle as _withAndroidProjectGradle,
  // withMapboxAndroid as _withMapboxAndroid,
};
