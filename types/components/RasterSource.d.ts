export const NATIVE_MODULE_NAME: "RCTMGLRasterSource";
export default RasterSource;
/**
 * RasterSource is a map content source that supplies raster image tiles to be shown on the map.
 * The location of and metadata about the tiles are defined either by an option dictionary
 * or by an external file that conforms to the TileJSON specification.
 */
declare class RasterSource extends AbstractSource {
    static propTypes: any;
    static defaultProps: {
        id: any;
    };
    constructor(props: any);
    render(): JSX.Element;
}
import AbstractSource from "./AbstractSource";
//# sourceMappingURL=RasterSource.d.ts.map