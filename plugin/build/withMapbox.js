"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._addMapboxMavenRepo = exports.addMapboxMavenRepo = exports.addMapboxInstallerBlock = exports.applyCocoaPodsModifications = exports.addConstantBlock = exports.addInstallerBlock = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const config_plugins_1 = require("expo/config-plugins");
const generateCode_1 = require("./generateCode");
let pkg = {
    name: '@rnmapbox/maps',
};
try {
    pkg = require('@rnmapbox/maps/package.json');
}
catch {
    // empty catch block
}
const addInstallerBlock = (src, blockName) => {
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
                const modified = (0, generateCode_1.removeGeneratedContents)(src, tag);
                if (!modified) {
                    return src;
                }
            }
        }
    }
    return (0, generateCode_1.mergeContents)({
        tag,
        src,
        newSrc: [`  ${blockName}_install do |installer|`, '  end'].join('\n'),
        anchor: /use_react_native/,
        // We can't go after the use_react_native block because it might have parameters, causing it to be multi-line (see react-native template).
        offset: 0,
        comment: '#',
    }).contents;
};
exports.addInstallerBlock = addInstallerBlock;
const addConstantBlock = (src, { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsDownloadToken, RNMapboxMapsUseV11, }) => {
    const tag = `@rnmapbox/maps-rnmapboxmapsimpl`;
    if (RNMapboxMapsVersion == null &&
        RNMapboxMapsDownloadToken == null &&
        RNMapboxMapsUseV11 == null) {
        const modified = (0, generateCode_1.removeGeneratedContents)(src, tag);
        if (!modified) {
            return src;
        }
        else {
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
    return (0, generateCode_1.mergeContents)({
        tag,
        src,
        newSrc: newSrc.join('\n'),
        anchor: /target .+ do/,
        // We can't go after the use_react_native block because it might have parameters, causing it to be multi-line (see react-native template).
        offset: 0,
        comment: '#',
    }).contents;
};
exports.addConstantBlock = addConstantBlock;
// Only the preinstaller block is required, the post installer block is
// used for spm (swift package manager) which Expo doesn't currently support.
const applyCocoaPodsModifications = (contents, { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsDownloadToken, RNMapboxMapsUseV11, }) => {
    // Ensure installer blocks exist
    let src = (0, exports.addConstantBlock)(contents, {
        RNMapboxMapsImpl,
        RNMapboxMapsVersion,
        RNMapboxMapsDownloadToken,
        RNMapboxMapsUseV11,
    });
    src = (0, exports.addInstallerBlock)(src, 'pre');
    src = (0, exports.addInstallerBlock)(src, 'post');
    src = (0, exports.addMapboxInstallerBlock)(src, 'pre');
    src = (0, exports.addMapboxInstallerBlock)(src, 'post');
    return src;
};
exports.applyCocoaPodsModifications = applyCocoaPodsModifications;
const addMapboxInstallerBlock = (src, blockName) => (0, generateCode_1.mergeContents)({
    tag: `@rnmapbox/maps-${blockName}_installer`,
    src,
    newSrc: `    $RNMapboxMaps.${blockName}_install(installer)`,
    anchor: new RegExp(`^\\s*${blockName}_install do \\|installer\\|`),
    offset: 1,
    comment: '#',
}).contents;
exports.addMapboxInstallerBlock = addMapboxInstallerBlock;
/**
 * Dangerously adds the custom installer hooks to the Podfile.
 * In the future this should be removed in favor of some custom hooks provided by Expo autolinking.
 *
 * https://github.com/rnmapbox/maps/blob/main/ios/install.md#react-native--0600
 */
const withCocoaPodsInstallerBlocks = (config, { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsDownloadToken, RNMapboxMapsUseV11, }) => (0, config_plugins_1.withDangerousMod)(config, [
    'ios',
    async (exportedConfig) => {
        const file = path_1.default.join(exportedConfig.modRequest.platformProjectRoot, 'Podfile');
        const contents = await fs_1.promises.readFile(file, 'utf8');
        await fs_1.promises.writeFile(file, (0, exports.applyCocoaPodsModifications)(contents, {
            RNMapboxMapsImpl,
            RNMapboxMapsVersion,
            RNMapboxMapsDownloadToken,
            RNMapboxMapsUseV11,
        }), 'utf-8');
        return exportedConfig;
    },
]);
const withAndroidPropertiesDownloadToken = (config, { RNMapboxMapsDownloadToken }) => {
    const key = 'MAPBOX_DOWNLOADS_TOKEN';
    if (RNMapboxMapsDownloadToken) {
        return (0, config_plugins_1.withGradleProperties)(config, (exportedConfig) => {
            exportedConfig.modResults = exportedConfig.modResults.filter((item) => !(item.type === 'property' && item.key === key));
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
const withAndroidPropertiesImpl2 = (config, { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsUseV11 }) => {
    const keyValues = {
        expoRNMapboxMapsImpl: RNMapboxMapsImpl,
        expoRNMapboxMapsVersion: RNMapboxMapsVersion,
        expoRNMapboxMapsUseV11: RNMapboxMapsUseV11,
    };
    const keys = Object.keys(keyValues);
    const values = Object.values(keyValues);
    if (values.filter((v) => v).length > 0) {
        return (0, config_plugins_1.withGradleProperties)(config, (exportedConfig) => {
            exportedConfig.modResults = exportedConfig.modResults.filter((item) => !(item.type === 'property' && keys.includes(item.key)));
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
const withAndroidProperties = (config, { RNMapboxMapsImpl, RNMapboxMapsDownloadToken, RNMapboxMapsVersion, RNMapboxMapsUseV11, }) => {
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
const addLibCppFilter = (appBuildGradle) => {
    if (appBuildGradle.includes("pickFirst 'lib/x86/libc++_shared.so'")) {
        return appBuildGradle;
    }
    return (0, generateCode_1.mergeContents)({
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
const appendContents = ({ src, newSrc, tag, comment, }) => {
    const header = (0, generateCode_1.createGeneratedHeaderComment)(newSrc, tag, comment);
    if (!src.includes(header)) {
        // Ensure the old generated contents are removed.
        const sanitizedTarget = (0, generateCode_1.removeGeneratedContents)(src, tag);
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
const addMapboxMavenRepo = (src) => appendContents({
    tag: '@rnmapbox/maps-v2-maven',
    src,
    newSrc: gradleMaven,
    comment: '//',
}).contents;
exports.addMapboxMavenRepo = addMapboxMavenRepo;
exports._addMapboxMavenRepo = exports.addMapboxMavenRepo;
const withAndroidAppGradle = (config) => (0, config_plugins_1.withAppBuildGradle)(config, ({ modResults, ...exportedConfig }) => {
    if (modResults.language !== 'groovy') {
        config_plugins_1.WarningAggregator.addWarningAndroid('withMapbox', `Cannot automatically configure app build.gradle if it's not groovy`);
        return { modResults, ...exportedConfig };
    }
    modResults.contents = addLibCppFilter(modResults.contents);
    return { modResults, ...exportedConfig };
});
const withAndroidProjectGradle = (config) => (0, config_plugins_1.withProjectBuildGradle)(config, ({ modResults, ...exportedConfig }) => {
    if (modResults.language !== 'groovy') {
        config_plugins_1.WarningAggregator.addWarningAndroid('withMapbox', `Cannot automatically configure app build.gradle if it's not groovy`);
        return { modResults, ...exportedConfig };
    }
    modResults.contents = (0, exports.addMapboxMavenRepo)(modResults.contents);
    return { modResults, ...exportedConfig };
});
const withMapboxAndroid = (config, { RNMapboxMapsImpl, RNMapboxMapsDownloadToken, RNMapboxMapsVersion, RNMapboxMapsUseV11, }) => {
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
const withMapbox = (config, { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsDownloadToken, RNMapboxMapsUseV11, }) => {
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
exports.default = (0, config_plugins_1.createRunOncePlugin)(withMapbox, pkg.name, pkg.version);
