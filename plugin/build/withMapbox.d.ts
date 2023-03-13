import { ConfigPlugin, XcodeProject } from 'expo/config-plugins';
declare type InstallerBlockName = 'pre' | 'post';
export declare type MapboxPlugProps = {
    RNMapboxMapsImpl?: string;
    RNMapboxMapsVersion?: string;
    RNMapboxMapsDownloadToken?: string;
};
export declare const addInstallerBlock: (src: string, blockName: InstallerBlockName) => string;
export declare const addConstantBlock: (src: string, { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsDownloadToken, }: MapboxPlugProps) => string;
export declare const applyCocoaPodsModifications: (contents: string, { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsDownloadToken, }: MapboxPlugProps) => string;
export declare const addMapboxInstallerBlock: (src: string, blockName: InstallerBlockName) => string;
/**
 * Exclude building for arm64 on simulator devices in the pbxproj project.
 * Without this, production builds targeting simulators will fail.
 */
export declare const setExcludedArchitectures: (project: XcodeProject) => XcodeProject;
export declare const addMapboxMavenRepo: (src: string) => string;
declare const _default: ConfigPlugin<MapboxPlugProps>;
export default _default;
export { addMapboxMavenRepo as _addMapboxMavenRepo, };
