import { type ConfigPlugin } from 'expo/config-plugins';
type InstallerBlockName = 'pre' | 'post';
export type MapboxPlugProps = {
    /**
     * @deprecated
     */
    RNMapboxMapsImpl?: 'mapbox';
    RNMapboxMapsVersion?: string;
    /**
     * @deprecated Download token is no longer required by Mapbox. Do not set this.
     */
    RNMapboxMapsDownloadToken?: string;
    RNMapboxMapsUseV11?: boolean;
    /**
     * Get the Mapbox Maps SDK through Swift Package Manager instead of CocoaPods on iOS.
     * `true`, or the options of `$RNMapboxMapsSwiftPackageManager`, see ios/install.md.
     */
    RNMapboxMapsSwiftPackageManager?: boolean | SwiftPackageManagerOptions;
};
export type SwiftPackageManagerOptions = {
    url?: string;
    requirement?: {
        kind: string;
        version?: string;
        minimumVersion?: string;
    };
    product_name?: string;
    link?: boolean;
};
export declare const addInstallerBlock: (src: string, blockName: InstallerBlockName) => string;
export declare const addConstantBlock: (src: string, { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsDownloadToken, RNMapboxMapsUseV11, RNMapboxMapsSwiftPackageManager, }: MapboxPlugProps) => string;
export declare const applyCocoaPodsModifications: (contents: string, { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsDownloadToken, RNMapboxMapsUseV11, RNMapboxMapsSwiftPackageManager, }: MapboxPlugProps) => string;
export declare const addMapboxInstallerBlock: (src: string, blockName: InstallerBlockName) => string;
export declare const addMapboxMavenRepo: (src: string) => string;
declare const _default: ConfigPlugin<MapboxPlugProps>;
export default _default;
export { addMapboxMavenRepo as _addMapboxMavenRepo, };
