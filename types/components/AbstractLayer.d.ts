export default AbstractLayer;
declare class AbstractLayer extends React.PureComponent<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    get baseProps(): {
        id: any;
        sourceID: any;
        reactStyle: {
            [key: string]: import("../utils/StyleValue").StyleValue;
        } | undefined;
        minZoomLevel: any;
        maxZoomLevel: any;
        aboveLayerID: any;
        belowLayerID: any;
        layerIndex: any;
        filter: any[];
        style: undefined;
    };
    getStyleTypeFormatter(styleType: any): typeof processColor | undefined;
    getStyle(): {
        [key: string]: import("../utils/StyleValue").StyleValue;
    } | undefined;
    setNativeProps(props: any): void;
}
import React from "react";
import { processColor } from "react-native";
//# sourceMappingURL=AbstractLayer.d.ts.map