export const NATIVE_MODULE_NAME: "RCTMGLVectorSource";
export default VectorSource;
declare const VectorSource_base: {
    new (props: any, nativeModuleName: any): {
        [x: string]: any;
        _nativeModuleName: any;
        _onAndroidCallback(e: any): void;
        _callbackMap: Map<any, any>;
        _preRefMapMethodQueue: any[];
        _addAddAndroidCallback(id: any, resolve: any, reject: any): void;
        _removeAndroidCallback(id: any): void;
        _runPendingNativeCommands(nativeRef: any): Promise<void>; /**
         * An unsigned integer that specifies the minimum zoom level at which to display tiles from the source.
         * The value should be between 0 and 22, inclusive, and less than
         * maxZoomLevel, if specified. The default value for this option is 0.
         */
        _runNativeCommand(methodName: any, nativeRef: any, args?: any[]): any;
    };
    [x: string]: any;
};
/**
 * VectorSource is a map content source that supplies tiled vector data in Mapbox Vector Tile format to be shown on the map.
 * The location of and metadata about the tiles are defined either by an option dictionary or by an external file that conforms to the TileJSON specification.
 */
declare class VectorSource extends VectorSource_base {
    static propTypes: any;
    static defaultProps: {
        id: any;
    };
    constructor(props: any);
    _setNativeRef(nativeRef: any): void;
    _nativeRef: any;
    /**
     * Returns all features that match the query parameters regardless of whether or not the feature is
     * currently rendered on the map. The domain of the query includes all currently-loaded vector tiles
     * and GeoJSON source tiles. This function does not check tiles outside of the visible viewport.
     *
     * @example
     * vectorSource.features(['id1', 'id2'])
     *
     * @param  {Array=} layerIDs - A set of strings that correspond to the names of layers defined in the current style. Only the features contained in these layers are included in the returned array.
     * @param  {Array=} filter - an optional filter statement to filter the returned Features.
     * @return {FeatureCollection}
     */
    features(layerIDs?: any[] | undefined, filter?: any[] | undefined): FeatureCollection;
    onPress(event: any): void;
    render(): JSX.Element;
}
//# sourceMappingURL=VectorSource.d.ts.map