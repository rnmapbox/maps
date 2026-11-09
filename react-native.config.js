const fs = require('fs');
const path = require('path');

const specsDir = path.join(__dirname, 'src/specs');

// Listing componentDescriptors replaces the CLI's auto-detection, which skips
// `interfaceOnly` components such as RNMBXMarkerViewContent. The regex is the
// CLI's (cli-config-android extractComponentDescriptors) without that check.
const componentDescriptors = fs
  .readdirSync(specsDir)
  .filter((file) => file.endsWith('NativeComponent.ts'))
  .map((file) => {
    const contents = fs.readFileSync(path.join(specsDir, file), 'utf8');
    const match = contents.match(
      /codegenNativeComponent(<.*>)?\s*\(\s*["'`](\w+)["'`]/m,
    );
    return match && `${match[2]}ComponentDescriptor`;
  })
  .filter(Boolean);

module.exports = {
  dependency: {
    platforms: {
      android: {
        componentDescriptors,
        cmakeListsPath: 'src/main/jni/CMakeLists.txt',
      },
    },
  },
};
