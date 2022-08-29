export const NATIVE_MODULE_NAME: "RCTMGLPointAnnotation";
export default PointAnnotation;
declare const PointAnnotation_base: {
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
 * PointAnnotation represents a one-dimensional shape located at a single geographical coordinate.
 *
 * Consider using ShapeSource and SymbolLayer instead, if you have many points and you have static images,
 * they'll offer much better performance.
 *
 * If you need interactive views please use MarkerView,
 * as with PointAnnotation on Android child views are rendered onto a bitmap for better performance.
 */
declare class PointAnnotation extends PointAnnotation_base {
    static propTypes: any;
    static defaultProps: {
        anchor: {
            x: number;
            y: number;
        };
        draggable: boolean;
    };
    constructor(props: any);
    _onSelected(e: any): void;
    _onDeselected(e: any): void;
    _onDragStart(e: any): void;
    _onDrag(e: any): void;
    _onDragEnd(e: any): void;
    _getCoordinate(): string | undefined;
    /**
     * On v10 and pre v10 android point annotation is rendered offscreen with a canvas into an image.
     * To rerender the image from the current state of the view call refresh.
     * Call this for example from Image#onLoad.
     */
    refresh(): void;
    _setNativeRef(nativeRef: any): void;
    _nativeRef: any;
    render(): JSX.Element;
}
//# sourceMappingURL=PointAnnotation.d.ts.map