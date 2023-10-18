import { ConfigPlugin } from 'expo/config-plugins';
declare type InstallerBlockName = 'pre' | 'post';
export declare type MapboxPlugProps = {
    RNMapboxMapsImpl?: string;
    /**
     * @platform ios
     */
    RNMapboxMapsVersion?: string;
    RNMapboxMapsDownloadToken?: string;
    /**
     * @platform ios
     */
    RNMapboxMapsUseV11?: boolean;
    /**
     * Enable if using static frameworks
     * @platform ios
     */
    RNMapboxMapsUseFrameworks?: boolean;
};
export declare const addInstallerBlock: (src: string, blockName: InstallerBlockName) => string;
export declare const addConstantBlock: (src: string, { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsDownloadToken, RNMapboxMapsUseV11, RNMapboxMapsUseFrameworks, }: MapboxPlugProps) => string;
export declare const applyCocoaPodsModifications: (contents: string, { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsDownloadToken, RNMapboxMapsUseV11, RNMapboxMapsUseFrameworks, }: MapboxPlugProps) => string;
export declare const addMapboxInstallerBlock: (src: string, blockName: InstallerBlockName) => string;
export declare const addMapboxMavenRepo: (src: string) => string;
declare const _default: ConfigPlugin<MapboxPlugProps>;
export default _default;
export { addMapboxMavenRepo as _addMapboxMavenRepo, };
