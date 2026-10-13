import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

import { packPackage } from './fixtures/packPackage';

describe('Packed package resolution', () => {
  let consumerDir;
  let projectRoot;

  beforeAll(() => {
    ({ consumerDir, projectRoot } = packPackage(['module']));
    // Only supply the declared Expo peer. Runtime React Native must never be
    // imported while loading the config plugin in Node.
    fs.symlinkSync(
      path.join(projectRoot, 'node_modules/expo'),
      path.join(consumerDir, 'node_modules/expo'),
      'junction',
    );
  }, 60000);

  afterAll(() => {
    if (consumerDir) {
      fs.rmSync(consumerDir, { recursive: true, force: true });
    }
  });

  function probe(...args) {
    // Jest maps @rnmapbox/maps to src and transforms ESM. Use unmodified Node
    // and Metro so neither behavior hides a published-artifact regression.
    return JSON.parse(
      execFileSync(
        process.execPath,
        [
          path.join(__dirname, 'fixtures/packageResolution.js'),
          consumerDir,
          projectRoot,
          ...args,
        ],
        { encoding: 'utf8', timeout: 10000 },
      ),
    );
  }

  // Expo Tools bundles 4.1.5, whose nearest-package.json lookup differs from
  // the SDK resolver. Exercise both real implementations against the archive.
  it.each(['expo-config-plugins-legacy', '@expo/config-plugins'])(
    'loads the package-name plugin using %s',
    (resolver) => {
      expect(probe('plugin', resolver, '@rnmapbox/maps')).toEqual({
        pluginFile: 'app.plugin.js',
        isPluginFile: true,
        mods: ['android', 'ios'],
      });
    },
  );

  it('keeps the explicit app.plugin.js export working', () => {
    expect(
      probe('plugin', '@expo/config-plugins', '@rnmapbox/maps/app.plugin.js'),
    ).toEqual({
      pluginFile: 'app.plugin.js',
      isPluginFile: true,
      mods: ['android', 'ios'],
    });
  });

  it.each(
    ['ios', 'android', 'web'].flatMap((platform) =>
      ['compiled', 'source'].map((condition) => [platform, condition]),
    ),
  )('resolves %s with the %s entry', (platform, condition) => {
    const directory = condition === 'source' ? 'src' : 'lib/module';
    const extension = condition === 'source' ? 'ts' : 'js';
    const componentExtension = condition === 'source' ? 'tsx' : 'js';
    const web = platform === 'web';
    expect(probe('metro', platform, condition)).toEqual([
      `${directory}/index.${extension}`,
      `${directory}/Mapbox${web ? '' : '.native'}.${extension}`,
      web
        ? `${directory}/web/index.${componentExtension}`
        : `${directory}/RNMBXModule.${extension}`,
      `${directory}/${web ? 'web/' : ''}components/Camera.${componentExtension}`,
      `${directory}/${web ? 'web/' : ''}components/MapView.${componentExtension}`,
    ]);
  });
});
