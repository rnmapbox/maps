export const NATIVE_MODULE_NAME: "RCTMGLTerrain";
export default Terrain;
/**
 * A global modifier that elevates layers and markers based on a DEM data source.
 */
declare class Terrain extends React.PureComponent<any, any, any> {
    static propTypes: any;
    static defaultProps: {
        sourceID: any;
    };
    constructor(props: any);
    constructor(props: any, context: any);
    get baseProps(): {
        sourceID: any;
    };
    render(): JSX.Element;
}
import React from "react";
//# sourceMappingURL=Terrain.d.ts.map