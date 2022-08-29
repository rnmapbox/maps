export const NATIVE_MODULE_NAME: "RCTMGLMarkerView";
export default MarkerView;
/**
 * MarkerView allows you to place a interactive react native marker to the map.
 *
 * If you have static view consider using PointAnnotation or SymbolLayer they'll offer much better performance
 * .
 * This is based on [MakerView plugin](https://docs.mapbox.com/android/plugins/overview/markerview/) on Android
 * and PointAnnotation on iOS.
 */
declare class MarkerView extends React.PureComponent<any, any, any> {
    static propTypes: any;
    static defaultProps: {
        anchor: {
            x: number;
            y: number;
        };
    };
    constructor(props: any);
    constructor(props: any, context: any);
    _getCoordinate(): string | undefined;
    render(): JSX.Element;
}
import React from "react";
//# sourceMappingURL=MarkerView.d.ts.map