export const NATIVE_MODULE_NAME: "RCTMGLShapeSource";
export default ShapeSource;
declare const ShapeSource_base: {
    new (props: any, nativeModuleName: any): {
        [x: string]: any;
        _nativeModuleName: any;
        _onAndroidCallback(e: any): void;
        _callbackMap: Map<any, any>;
        _preRefMapMethodQueue: any[];
        _addAddAndroidCallback(id: any, resolve: any, reject: any): void;
        _removeAndroidCallback(id: any): void;
        _runPendingNativeCommands(nativeRef: any): Promise<void>;
        _runNativeCommand(methodName: any, nativeRef: any, args?: any[]): any;
    };
    [x: string]: any;
};
/**
 * ShapeSource is a map content source that supplies vector shapes to be shown on the map.
 * The shape may be a url or a GeoJSON object
 */
declare class ShapeSource extends ShapeSource_base {
    static NATIVE_ASSETS_KEY: string;
    static propTypes: any;
    static defaultProps: {
        id: any;
    };
    constructor(props: any);
    _setNativeRef(nativeRef: any): void;
    _nativeRef: any;
    /**
     * Returns all features from the source that match the query parameters regardless of whether or not the feature is
     * currently rendered on the map.
     *
     * @example
     * shapeSource.features()
     *
     * @param  {Array=} filter - an optional filter statement to filter the returned Features.
     * @return {FeatureCollection}
     */
    features(filter?: any[] | undefined): FeatureCollection;
    /**
     * Returns the zoom needed to expand the cluster.
     *
     * @example
     * const zoom = await shapeSource.getClusterExpansionZoom(clusterId);
     *
     * @param  {Feature} feature - The feature cluster to expand.
     * @return {number}
     */
    getClusterExpansionZoom(feature: Feature): number;
    /**
     * Returns the FeatureCollection from the cluster.
     *
     * @example
     * const collection = await shapeSource.getClusterLeaves(clusterId, limit, offset);
     *
     * @param  {Feature} feature - The feature cluster to expand.
     * @param  {number} limit - The number of points to return.
     * @param  {number} offset - The amount of points to skip (for pagination).
     * @return {FeatureCollection}
     */
    getClusterLeaves(feature: Feature, limit: number, offset: number): FeatureCollection;
    /**
     * Returns the FeatureCollection from the cluster (on the next zoom level).
     *
     * @example
     * const collection = await shapeSource.getClusterChildren(clusterId);
     *
     * @param  {Feature} feature - The feature cluster to expand.
     * @return {FeatureCollection}
     */
    getClusterChildren(feature: Feature): FeatureCollection;
    setNativeProps(props: any): void;
    _getShape(): string | undefined;
    onPress(event: any): void;
    render(): JSX.Element;
}
//# sourceMappingURL=ShapeSource.d.ts.map