export const NATIVE_MODULE_NAME: "RCTMGLSymbolLayer";
export default SymbolLayer;
/**
 * SymbolLayer is a style layer that renders icon and text labels at points or along lines on the map.
 */
declare class SymbolLayer extends AbstractLayer {
    static propTypes: any;
    static defaultProps: {
        sourceID: any;
    };
    _shouldSnapshot(): boolean;
    render(): JSX.Element;
}
import AbstractLayer from "./AbstractLayer";
//# sourceMappingURL=SymbolLayer.d.ts.map