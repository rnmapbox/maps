export default NativeUserLocation;
declare class NativeUserLocation extends React.Component<any, any, any> {
    static propTypes: {
        /**
         * Android render mode.
         *
         *  - normal: just a circle
         *  - compass: triangle with heading
         *  - gps: large arrow
         *
         * @platform android
         */
        androidRenderMode: PropTypes.Requireable<string>;
        /**
         * iOS only. A Boolean value indicating whether the user location annotation may display a permanent heading indicator.
         *
         * @platform ios
         */
        iosShowsUserHeadingIndicator: PropTypes.Requireable<boolean>;
    };
    constructor(props: any);
    constructor(props: any, context: any);
    render(): JSX.Element;
}
import React from "react";
import PropTypes from "prop-types";
//# sourceMappingURL=NativeUserLocation.d.ts.map