import fs from 'fs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Scans the src/specs directory for NativeComponent files and extracts
 * the component name from the codegenNativeComponent calls
 */
function extractNativeComponentsFromSpecs() {
  const specsDir = path.join(__dirname, '..', '..', 'src', 'specs');
  const nativeComponentFiles = fs
    .readdirSync(specsDir)
    .filter((file) => file.endsWith('NativeComponent.ts'));

  const components = {};

  for (const file of nativeComponentFiles) {
    const filePath = path.join(specsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract the component name from codegenNativeComponent('ComponentName')
    const match = content.match(
      /codegenNativeComponent<[^>]*>\(\s*['"`]([^'"`]+)['"`]/,
    );

    if (match) {
      const [, componentName] = match; // e.g., 'RNMBXMapView'
      const nativeComponentName = file.replace('.ts', ''); // e.g., 'RNMBXMapViewNativeComponent'
      const className = `${componentName}ComponentView`; // e.g., 'RNMBXMapViewComponentView'

      components[componentName] = {
        className: className,
        nativeComponentName: nativeComponentName,
        file: file,
      };
    }
  }

  return components;
}

/**
 * Generates the iOS components configuration for package.json codegenConfig
 */
function generateIOSComponentsConfig() {
  const components = extractNativeComponentsFromSpecs();

  const iosConfig = {
    components: {},
    componentsProvider: {},
  };

  for (const [componentName, info] of Object.entries(components)) {
    iosConfig.components[componentName] = {
      className: info.className,
    };
    iosConfig.componentsProvider[componentName] = info.className;
  }

  return iosConfig;
}

/**
 * Updates the package.json file with the generated iOS components configuration
 */
function updatePackageJsonWithIOSComponents() {
  const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const iosConfig = generateIOSComponentsConfig();

  // Ensure codegenConfig exists
  if (!packageJson.codegenConfig) {
    packageJson.codegenConfig = {
      name: 'rnmapbox_maps_specs',
      type: 'all',
      jsSrcsDir: 'src/specs',
      android: {
        javaPackageName: 'com.rnmapbox.rnmbx',
      },
    };
  }

  // Ensure ios config exists
  if (!packageJson.codegenConfig.ios) {
    packageJson.codegenConfig.ios = {};
  }

  // Update iOS components
  packageJson.codegenConfig.ios.components = iosConfig.components;
  packageJson.codegenConfig.ios.componentsProvider =
    iosConfig.componentsProvider;

  // Write back to package.json with proper formatting
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
  );

  console.log(
    `Updated package.json with ${Object.keys(iosConfig.components).length} iOS components`,
  );
  return Object.keys(iosConfig.components);
}

export {
  extractNativeComponentsFromSpecs,
  generateIOSComponentsConfig,
  updatePackageJsonWithIOSComponents,
};
