import { ConfigPlugin } from 'expo/config-plugins';
type InstallerBlockName = 'pre' | 'post';
export type MapboxPlugProps = {
    /**
     * @deprecated
     */
    RNMapboxMapsImpl?: 'mapbox';
    RNMapboxMapsVersion?: string;
    RNMapboxMapsDownloadToken?: string;
    RNMapboxMapsUseV11?: boolean;
};
export declare const addInstallerBlock: (src: string, blockName: InstallerBlockName) => string;
export declare const addConstantBlock: (src: string, { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsDownloadToken, RNMapboxMapsUseV11, }: MapboxPlugProps) => string;
export declare const applyCocoaPodsModifications: (contents: string, { RNMapboxMapsImpl, RNMapboxMapsVersion, RNMapboxMapsDownloadToken, RNMapboxMapsUseV11, }: MapboxPlugProps) => string;
export declare const addMapboxInstallerBlock: (src: string, blockName: InstallerBlockName) => string;
export declare const addMapboxMavenRepo: (src: string) => string;
declare const _default: ConfigPlugin<MapboxPlugProps>;
export default _default;
export { addMapboxMavenRepo as _addMapboxMavenRepo, };
