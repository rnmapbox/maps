"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._addMapboxMavenRepo = exports.addMapboxMavenRepo = exports.setExcludedArchitectures = exports.addMapboxInstallerBlock = exports.addInstallerBlock = exports.addConstantBlock = exports.applyCocoaPodsModifications = void 0;
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
/**
 * Dangerously adds the custom installer hooks to the Podfile.
 * In the future this should be removed in favor of some custom hooks provided by Expo autolinking.
 *
 * https://github.com/rnmapbox/maps/blob/main/ios/install.md#react-native--0600
 * @param config
 * @returns
 */
const withCocoaPodsInstallerBlocks = (c, { RNMapboxMapsImpl, RNMapboxMapsDownloadToken }) => {
    return (0, config_plugins_1.withDangerousMod)(c, [
        'ios',
        async (config) => {
            const file = path_1.default.join(config.modRequest.platformProjectRoot, 'Podfile');
            const contents = await fs_1.promises.readFile(file, 'utf8');
            await fs_1.promises.writeFile(file, applyCocoaPodsModifications(contents, {
                RNMapboxMapsImpl,
                RNMapboxMapsDownloadToken,
            }), 'utf-8');
            return config;
        },
    ]);
};
// Only the preinstaller block is required, the post installer block is
// used for spm (swift package manager) which Expo doesn't currently support.
function applyCocoaPodsModifications(contents, { RNMapboxMapsImpl, RNMapboxMapsDownloadToken }) {
    // Ensure installer blocks exist
    let src = addConstantBlock(contents, RNMapboxMapsImpl, RNMapboxMapsDownloadToken);
    src = addInstallerBlock(src, 'pre');
    src = addInstallerBlock(src, 'post');
    src = addMapboxInstallerBlock(src, 'pre');
    src = addMapboxInstallerBlock(src, 'post');
    return src;
}
exports.applyCocoaPodsModifications = applyCocoaPodsModifications;
function addConstantBlock(src, RNMapboxMapsImpl, RNMapboxMapsDownloadToken) {
    const tag = `@rnmapbox/maps-rnmapboxmapsimpl`;
    if (RNMapboxMapsImpl == null) {
        const modified = (0, generateCode_1.removeGeneratedContents)(src, tag);
        if (!modified) {
            return src;
        }
        else {
            return modified;
        }
    }
    return (0, generateCode_1.mergeContents)({
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
exports.addConstantBlock = addConstantBlock;
function addInstallerBlock(src, blockName) {
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
}
exports.addInstallerBlock = addInstallerBlock;
function addMapboxInstallerBlock(src, blockName) {
    return (0, generateCode_1.mergeContents)({
        tag: `@rnmapbox/maps-${blockName}_installer`,
        src,
        newSrc: `    $RNMapboxMaps.${blockName}_install(installer)`,
        anchor: new RegExp(`^\\s*${blockName}_install do \\|installer\\|`),
        offset: 1,
        comment: '#',
    }).contents;
}
exports.addMapboxInstallerBlock = addMapboxInstallerBlock;
/**
 * Exclude building for arm64 on simulator devices in the pbxproj project.
 * Without this, production builds targeting simulators will fail.
 */
function setExcludedArchitectures(project) {
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
exports.setExcludedArchitectures = setExcludedArchitectures;
const withExcludedSimulatorArchitectures = (c) => {
    return (0, config_plugins_1.withXcodeProject)(c, (config) => {
        config.modResults = setExcludedArchitectures(config.modResults);
        return config;
    });
};
const withAndroidPropertiesDownloadToken = (config, { RNMapboxMapsDownloadToken }) => {
    const key = 'MAPBOX_DOWNLOADS_TOKEN';
    if (RNMapboxMapsDownloadToken) {
        return (0, config_plugins_1.withGradleProperties)(config, (config) => {
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
    }
    else {
        return config;
    }
};
const withAndroidPropertiesImpl2 = (config, { RNMapboxMapsImpl }) => {
    const key = 'expoRNMapboxMapsImpl';
    if (RNMapboxMapsImpl) {
        return (0, config_plugins_1.withGradleProperties)(config, (config) => {
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
    }
    else {
        return config;
    }
};
const withAndroidProperties = (config, { RNMapboxMapsImpl, RNMapboxMapsDownloadToken }) => {
    config = withAndroidPropertiesDownloadToken(config, {
        RNMapboxMapsDownloadToken,
    });
    config = withAndroidPropertiesImpl2(config, { RNMapboxMapsImpl });
    return config;
};
const addLibCppFilter = (appBuildGradle) => {
    if (appBuildGradle.includes("pickFirst 'lib/x86/libc++_shared.so'"))
        return appBuildGradle;
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
function appendContents({ src, newSrc, tag, comment, }) {
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
}
function addMapboxMavenRepo(src) {
    return appendContents({
        tag: '@rnmapbox/maps-v2-maven',
        src,
        newSrc: gradleMaven,
        comment: '//',
    }).contents;
}
exports.addMapboxMavenRepo = addMapboxMavenRepo;
exports._addMapboxMavenRepo = addMapboxMavenRepo;
const withAndroidAppGradle = (config) => {
    return (0, config_plugins_1.withAppBuildGradle)(config, ({ modResults, ...config }) => {
        if (modResults.language !== 'groovy') {
            config_plugins_1.WarningAggregator.addWarningAndroid('withMapbox', `Cannot automatically configure app build.gradle if it's not groovy`);
            return { modResults, ...config };
        }
        modResults.contents = addLibCppFilter(modResults.contents);
        return { modResults, ...config };
    });
};
const withAndroidProjectGradle = (config) => {
    return (0, config_plugins_1.withProjectBuildGradle)(config, ({ modResults, ...config }) => {
        if (modResults.language !== 'groovy') {
            config_plugins_1.WarningAggregator.addWarningAndroid('withMapbox', `Cannot automatically configure app build.gradle if it's not groovy`);
            return { modResults, ...config };
        }
        modResults.contents = addMapboxMavenRepo(modResults.contents);
        return { modResults, ...config };
    });
};
const withMapboxAndroid = (config, { RNMapboxMapsImpl, RNMapboxMapsDownloadToken }) => {
    config = withAndroidProperties(config, {
        RNMapboxMapsImpl,
        RNMapboxMapsDownloadToken,
    });
    config = withAndroidProjectGradle(config, { RNMapboxMapsImpl });
    config = withAndroidAppGradle(config, { RNMapboxMapsImpl });
    return config;
};
const withMapbox = (config, { RNMapboxMapsImpl, RNMapboxMapsDownloadToken }) => {
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
exports.default = (0, config_plugins_1.createRunOncePlugin)(withMapbox, pkg.name, pkg.version);
