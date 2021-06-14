import {promises} from 'fs';
import path from 'path';

import {
  ConfigPlugin,
  createRunOncePlugin,
  withDangerousMod,
} from '@expo/config-plugins';
import {
  mergeContents,
  removeGeneratedContents,
} from '@expo/config-plugins/build/utils/generateCode';

let pkg: {name: string; version?: string} = {
  name: '@react-native-mapbox-gl/maps',
};
try {
  pkg = require('@react-native-mapbox-gl/maps/package.json');
} catch {}

type InstallerBlockName = 'pre' | 'post';

/**
 * Dangerously adds the custom installer hooks to the Podfile.
 * In the future this should be removed in favor of some custom hooks provided by Expo autolinking.
 *
 * https://github.com/react-native-mapbox-gl/maps/blob/master/ios/install.md#react-native--0600
 * @param config
 * @returns
 */
const withCocoaPodsInstallerBlocks: ConfigPlugin = (c) => {
  return withDangerousMod(c, [
    'ios',
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      const contents = await promises.readFile(file, 'utf8');

      await promises.writeFile(
        file,
        applyCocoaPodsModifications(contents),
        'utf-8',
      );
      return config;
    },
  ]);
};

// Only the preinstaller block is required, the post installer block is
// used for spm (swift package manager) which Expo doesn't currently support.
export function applyCocoaPodsModifications(contents: string): string {
  // Ensure installer blocks exist
  let src = addInstallerBlock(contents, 'pre');
  // src = addInstallerBlock(src, "post");
  src = addMapboxInstallerBlock(src, 'pre');
  // src = addMapboxInstallerBlock(src, "post");
  return src;
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
    tag: `@react-native-mapbox-gl/maps-${blockName}_installer`,
    src,
    newSrc: `    $RNMBGL.${blockName}_install(installer)`,
    anchor: new RegExp(`${blockName}_install do \\|installer\\|`),
    offset: 1,
    comment: '#',
  }).contents;
}

const withMapbox: ConfigPlugin = (config) => {
  return withCocoaPodsInstallerBlocks(config);
};

export default createRunOncePlugin(withMapbox, pkg.name, pkg.version);
