export const NATIVE_MODULE_NAME: "RCTMGLSkyLayer";
export default SkyLayer;
/**
 * SkyLayer is a spherical dome around the map that is always rendered behind all other layers
 */
declare class SkyLayer extends AbstractLayer {
    static propTypes: any;
    static defaultProps: {
        sourceID: any;
    };
    render(): JSX.Element;
}
import AbstractLayer from "./AbstractLayer";
//# sourceMappingURL=SkyLayer.d.ts.map