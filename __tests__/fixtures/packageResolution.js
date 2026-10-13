const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const [consumerDir, projectRoot, mode, ...options] = process.argv.slice(2);
const projectRequire = createRequire(path.join(projectRoot, 'package.json'));
const consumerRequire = createRequire(path.join(consumerDir, 'index.js'));
const packageDir = path.dirname(
  consumerRequire.resolve('@rnmapbox/maps/package.json'),
);

function packageRelativePath(file) {
  return path.relative(packageDir, file).split(path.sep).join('/');
}

if (mode === 'plugin') {
  const [resolver, reference] = options;
  const { resolveConfigPluginFunctionWithInfo } = projectRequire(
    `${resolver}/build/utils/plugin-resolver`,
  );
  const { plugin, pluginFile, isPluginFile } =
    resolveConfigPluginFunctionWithInfo(consumerDir, reference);
  const config = plugin({ name: 'package-test', slug: 'package-test' });
  process.stdout.write(
    JSON.stringify({
      pluginFile: packageRelativePath(pluginFile),
      isPluginFile,
      mods: Object.keys(config.mods).sort(),
    }),
  );
} else {
  const [platform, sourceCondition] = options;
  const { resolve } = projectRequire('metro-resolver');
  const { parse } = projectRequire('@babel/parser');
  const context = {
    allowHaste: false,
    assetExts: new Set(['png', 'css']),
    customResolverOptions: {},
    disableHierarchicalLookup: false,
    isESMImport: true,
    mainFields: ['react-native', 'browser', 'main'],
    nodeModulesPaths: [],
    preferNativePlatform: platform !== 'web',
    sourceExts: ['js', 'jsx', 'ts', 'tsx'],
    unstable_enablePackageExports: true,
    unstable_conditionNames: sourceCondition === 'source' ? ['source'] : [],
    unstable_conditionsByPlatform: {
      ios: ['react-native'],
      android: ['react-native'],
      web: ['browser'],
    },
    unstable_logWarning(message) {
      throw new Error(message);
    },
    resolveAsset() {
      return null;
    },
    doesFileExist(file) {
      return fs.existsSync(file) && fs.statSync(file).isFile();
    },
    fileSystemLookup(file) {
      if (!fs.existsSync(file)) {
        return { exists: false };
      }
      return {
        exists: true,
        type: fs.statSync(file).isDirectory() ? 'd' : 'f',
        realPath: fs.realpathSync(file),
      };
    },
    getPackage(file) {
      return fs.existsSync(file)
        ? JSON.parse(fs.readFileSync(file, 'utf8'))
        : null;
    },
    getPackageForModule(file) {
      let directory =
        fs.existsSync(file) && fs.statSync(file).isDirectory()
          ? file
          : path.dirname(file);
      while (directory !== path.dirname(directory)) {
        const packageJson = context.getPackage(
          path.join(directory, 'package.json'),
        );
        if (packageJson) {
          return {
            rootPath: directory,
            packageJson,
            packageRelativePath: path.relative(directory, file),
          };
        }
        directory = path.dirname(directory);
      }
      return null;
    },
  };
  function resolveFrom(originModulePath, specifier) {
    return resolve({ ...context, originModulePath }, specifier, platform)
      .filePath;
  }
  function dependency(file, specifier) {
    const ast = parse(fs.readFileSync(file, 'utf8'), {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });
    const declaration = ast.program.body.find(
      (node) =>
        node.source?.value.replace(/(?:\/index)?\.js$/, '') === specifier,
    );
    if (!declaration) {
      throw new Error(`Missing ${specifier} dependency in ${file}`);
    }
    return resolveFrom(file, declaration.source.value);
  }
  const entry = resolveFrom(
    path.join(consumerDir, 'index.js'),
    '@rnmapbox/maps',
  );
  const mapbox = dependency(entry, './Mapbox');
  const implementation = dependency(
    mapbox,
    platform === 'web' ? './web' : './RNMBXModule',
  );
  const components = platform === 'web' ? implementation : mapbox;
  const camera = dependency(components, './components/Camera');
  const mapView = dependency(components, './components/MapView');
  process.stdout.write(
    JSON.stringify(
      [entry, mapbox, implementation, camera, mapView].map(packageRelativePath),
    ),
  );
}
