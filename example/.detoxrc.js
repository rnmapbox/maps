module.exports = {
  testRunner: {
    $0: 'jest',
    args: {
      config: 'e2e/config.js',
    },
  },
  apps: {
    "ios": {
      type: "ios.app",
      build: "xcodebuild -quiet -workspace ios/RNMapboxGLExample.xcworkspace -configuration Release -scheme RNMapboxGLExample -sdk iphonesimulator -derivedDataPath ios/build -destination 'platform=iOS Simulator,name=iPhone SE (3rd generation)'",
      binaryPath: "ios/build/Build/Products/Release-iphonesimulator/RNMapboxGLExample.app"
    },
    "ios.debug": {
      type: "ios.app",
      build: "FORCE_BUNDLING=1 xcodebuild -quiet -workspace ios/RNMapboxGLExample.xcworkspace -configuration Debug -scheme RNMapboxGLExample GCC_PREPROCESSOR_DEFINITIONS='$GCC_PREPROCESSOR_DEFINITIONS DEBUG_RCT_BUNDLE=1' -sdk iphonesimulator -derivedDataPath ios/build -destination 'platform=iOS Simulator,name=iPhone SE (3rd generation)'",
      binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/RNMapboxGLExample.app"
    }
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        type: "iPhone SE (3rd generation)"
      }
    }
  },
  configurations: {
    "ios": {
      device: "simulator",
      app: "ios"
    },
    "ios.debug": {
      device: "simulator",
      app: "ios.debug"
    }
  }
};