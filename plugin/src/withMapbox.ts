import { promises } from 'fs';
import path from 'path';

import {
  ConfigPlugin,
  createRunOncePlugin,
  withDangerousMod,
  withGradleProperties,
  WarningAggregator,
  withProjectBuildGradle,
  withAppBuildGradle,
} from 'expo/config-plugins';

import {
  mergeContents,
  createGeneratedHeaderComment,
  removeGeneratedContents,
  MergeResults,
} from './generateCode';

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
  /**
   * @deprecated
   */
  RNMapboxMapsImpl?: 'mapbox';

  RNMapboxMapsVersion?: string;

  RNMapboxMapsDownloadToken?: string;

  RNMapboxMapsUseV11?: boolean;
};

export const addInstallerBlock = (
  src: string,
  blockName: InstallerBlockName,
): string => {
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
};

export const addConstantBlock = (
  src: string,
  {
    RNMapboxMapsImpl,
    RNMapboxMapsVersion,
    RNMapboxMapsDownloadToken,
    RNMapboxMapsUseV11,
  }: MapboxPlugProps,
): string => {
  const tag = `@rnmapbox/maps-rnmapboxmapsimpl`;

  if (
    RNMapboxMapsVersion == null &&
    RNMapboxMapsDownloadToken == null &&
    RNMapboxMapsUseV11 == null
  ) {
    const modified = removeGeneratedContents(src, tag);
    if (!modified) {
      return src;
    } else {
      return modified;
    }
  }

  const newSrc = [];

  if (RNMapboxMapsDownloadToken) {
    newSrc.push(`$RNMapboxMapsDownloadToken = '${RNMapboxMapsDownloadToken}'`);
  }

  if (RNMapboxMapsImpl) {
    newSrc.push(`$RNMapboxMapsImpl = '${RNMapboxMapsImpl}'`);
  }

  if (RNMapboxMapsVersion) {
    newSrc.push(`$RNMapboxMapsVersion = '${RNMapboxMapsVersion}'`);
  }

  if (RNMapboxMapsUseV11) {
    newSrc.push(`$RNMapboxMapsUseV11 = true`);
  }

  return mergeContents({
    tag,
    src,
    newSrc: newSrc.join('\n'),
    anchor: /target .+ do/,
    // We can't go after the use_react_native block because it might have parameters, causing it to be multi-line (see react-native template).
    offset: 0,
    comment: '#',
  }).contents;
};

// Only the preinstaller block is required, the post installer block is
// used for spm (swift package manager) which Expo doesn't currently support.
export const applyCocoaPodsModifications = (
  contents: string,
  {
    RNMapboxMapsImpl,
    RNMapboxMapsVersion,
    RNMapboxMapsDownloadToken,
    RNMapboxMapsUseV11,
  }: MapboxPlugProps,
): string => {
  // Ensure installer blocks exist
  let src = addConstantBlock(contents, {
    RNMapboxMapsImpl,
    RNMapboxMapsVersion,
    RNMapboxMapsDownloadToken,
    RNMapboxMapsUseV11,
  });
  src = addInstallerBlock(src, 'pre');
  src = addInstallerBlock(src, 'post');
  src = addMapboxInstallerBlock(src, 'pre');
  src = addMapboxInstallerBlock(src, 'post');

  return src;
};

export const addMapboxInstallerBlock = (
  src: string,
  blockName: InstallerBlockName,
): string =>
  mergeContents({
    tag: `@rnmapbox/maps-${blockName}_installer`,
    src,
    newSrc: `    $RNMapboxMaps.${blockName}_install(installer)`,
    anchor: new RegExp(`^\\s*${blockName}_install do \\|installer\\|`),
    offset: 1,
    comment: '#',
  }).contents;

/**
 * Dangerously adds the custom installer hooks to the Podfile.
 * In the future this should be removed in favor of some custom hooks provided by Expo autolinking.
 *
 * https://github.com/rnmapbox/maps/blob/main/ios/install.md#react-native--0600
 */
const withCocoaPodsInstallerBlocks: ConfigPlugin<MapboxPlugProps> = (
  config,
  {
    RNMapboxMapsImpl,
    RNMapboxMapsVersion,
    RNMapboxMapsDownloadToken,
    RNMapboxMapsUseV11,
  },
) =>
  withDangerousMod(config, [
    'ios',
    async (exportedConfig) => {
      const file = path.join(
        exportedConfig.modRequest.platformProjectRoot,
        'Podfile',
      );

      const contents = await promises.readFile(file, 'utf8');
      await promises.writeFile(
        file,
        applyCocoaPodsModifications(contents, {
          RNMapboxMapsImpl,
          RNMapboxMapsVersion,
          RNMapboxMapsDownloadToken,
          RNMapboxMapsUseV11,
        }),
        'utf-8',
      );

      return exportedConfig;
    },
  ]);

const withAndroidPropertiesDownloadToken: ConfigPlugin<MapboxPlugProps> = (
  config,
  { RNMapboxMapsDownloadToken },
) => {
  const key = 'MAPBOX_DOWNLOADS_TOKEN';

  if (RNMapboxMapsDownloadToken) {
    return withGradleProperties(config, (exportedConfig) => {
      exportedConfig.modResults = exportedConfig.modResults.filter(
        (item) => !(item.type === 'property' && item.key === key),
      );
      exportedConfig.modResults.push({
        type: 'property',
        key,
        value: RNMapboxMapsDownloadToken,
      });

      return exportedConfig;
    });
  }

  return config;
};

const withAndroidPropertiesImpl2: ConfigPlugin<MapboxPlugProps> = (
  config,
  { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsUseV11 },
) => {
  const keyValues = {
    expoRNMapboxMapsImpl: RNMapboxMapsImpl,
    expoRNMapboxMapsVersion: RNMapboxMapsVersion,
    expoRNMapboxMapsUseV11: RNMapboxMapsUseV11,
  } as const;
  type Keys = keyof typeof keyValues;
  const keys = Object.keys(keyValues) as Keys[];
  const values = Object.values(keyValues);

  if (values.filter((v) => v).length > 0) {
    return withGradleProperties(config, (exportedConfig) => {
      exportedConfig.modResults = exportedConfig.modResults.filter(
        (item) =>
          !(item.type === 'property' && (keys as string[]).includes(item.key)),
      );
      keys.forEach((key) => {
        const value = keyValues[key];
        if (value != null) {
          exportedConfig.modResults.push({
            type: 'property',
            key: key,
            value: value.toString(),
          });
        }
      });

      return exportedConfig;
    });
  }

  return config;
};

const withAndroidProperties: ConfigPlugin<MapboxPlugProps> = (
  config,
  {
    RNMapboxMapsImpl,
    RNMapboxMapsDownloadToken,
    RNMapboxMapsVersion,
    RNMapboxMapsUseV11,
  },
) => {
  config = withAndroidPropertiesDownloadToken(config, {
    RNMapboxMapsDownloadToken,
  });
  config = withAndroidPropertiesImpl2(config, {
    RNMapboxMapsImpl,
    RNMapboxMapsVersion,
    RNMapboxMapsUseV11,
  });

  return config;
};

const addLibCppFilter = (appBuildGradle: string): string => {
  if (appBuildGradle.includes("pickFirst 'lib/x86/libc++_shared.so'")) {
    return appBuildGradle;
  }

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

// Because we need the package to be added AFTER the React and Google maven packages, we create a new allprojects.
// It's ok to have multiple allprojects.repositories, so we create a new one since it's cheaper than tokenizing
// the existing block to find the correct place to insert our mapbox maven.
const gradleMaven = `
allprojects {
  repositories {
    maven {
      url 'https://api.mapbox.com/downloads/v2/releases/maven'
      authentication { basic(BasicAuthentication) }
      credentials {
        username = 'mapbox'
        password = project.properties['MAPBOX_DOWNLOADS_TOKEN'] ?: ""
      }
    }
  }
}
`;

// Fork of config-plugins mergeContents, but appends the contents to the end of the file.
const appendContents = ({
  src,
  newSrc,
  tag,
  comment,
}: {
  src: string;
  newSrc: string;
  tag: string;
  comment: string;
}): MergeResults => {
  const header = createGeneratedHeaderComment(newSrc, tag, comment);

  if (!src.includes(header)) {
    // Ensure the old generated contents are removed.
    const sanitizedTarget = removeGeneratedContents(src, tag);
    const contentsToAdd = [
      // @something
      header,
      // contents
      newSrc,
      // @end
      `${comment} @generated end ${tag}`,
    ].join('\n');

    return {
      contents: sanitizedTarget ?? src + contentsToAdd,
      didMerge: true,
      didClear: !!sanitizedTarget,
    };
  }

  return { contents: src, didClear: false, didMerge: false };
};

export const addMapboxMavenRepo = (src: string): string =>
  appendContents({
    tag: '@rnmapbox/maps-v2-maven',
    src,
    newSrc: gradleMaven,
    comment: '//',
  }).contents;

const withAndroidAppGradle: ConfigPlugin<MapboxPlugProps> = (config) =>
  withAppBuildGradle(config, ({ modResults, ...exportedConfig }) => {
    if (modResults.language !== 'groovy') {
      WarningAggregator.addWarningAndroid(
        'withMapbox',
        `Cannot automatically configure app build.gradle if it's not groovy`,
      );

      return { modResults, ...exportedConfig };
    }

    modResults.contents = addLibCppFilter(modResults.contents);

    return { modResults, ...exportedConfig };
  });

const withAndroidProjectGradle: ConfigPlugin<MapboxPlugProps> = (config) =>
  withProjectBuildGradle(config, ({ modResults, ...exportedConfig }) => {
    if (modResults.language !== 'groovy') {
      WarningAggregator.addWarningAndroid(
        'withMapbox',
        `Cannot automatically configure app build.gradle if it's not groovy`,
      );

      return { modResults, ...exportedConfig };
    }

    modResults.contents = addMapboxMavenRepo(modResults.contents);

    return { modResults, ...exportedConfig };
  });

const withMapboxAndroid: ConfigPlugin<MapboxPlugProps> = (
  config,
  {
    RNMapboxMapsImpl,
    RNMapboxMapsDownloadToken,
    RNMapboxMapsVersion,
    RNMapboxMapsUseV11,
  },
) => {
  config = withAndroidProperties(config, {
    RNMapboxMapsImpl,
    RNMapboxMapsDownloadToken,
    RNMapboxMapsVersion,
    RNMapboxMapsUseV11,
  });
  config = withAndroidProjectGradle(config, { RNMapboxMapsImpl });
  config = withAndroidAppGradle(config, { RNMapboxMapsImpl });

  return config;
};

const withMapbox: ConfigPlugin<MapboxPlugProps> = (
  config,
  {
    RNMapboxMapsImpl,
    RNMapboxMapsVersion,
    RNMapboxMapsDownloadToken,
    RNMapboxMapsUseV11,
  },
) => {
  config = withMapboxAndroid(config, {
    RNMapboxMapsImpl,
    RNMapboxMapsVersion,
    RNMapboxMapsUseV11,
    RNMapboxMapsDownloadToken,
  });
  config = withCocoaPodsInstallerBlocks(config, {
    RNMapboxMapsImpl,
    RNMapboxMapsVersion,
    RNMapboxMapsDownloadToken,
    RNMapboxMapsUseV11,
  });

  return config;
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
