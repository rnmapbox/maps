export function normalIcon(showsUserHeadingIndicator: any, heading: any): JSX.Element[];
export default UserLocation;
declare class UserLocation extends React.Component<any, any, any> {
    static propTypes: {
        /**
         * Whether location icon is animated between updates
         */
        animated: PropTypes.Requireable<boolean>;
        /**
         * Which render mode to use.
         * Can either be `normal` or `native`
         */
        renderMode: PropTypes.Requireable<string>;
        /**
         * native/android only render mode
         *
         *  - normal: just a circle
         *  - compass: triangle with heading
         *  - gps: large arrow
         *
         * @platform android
         */
        androidRenderMode: PropTypes.Requireable<string>;
        /**
         * Whether location icon is visible
         */
        visible: PropTypes.Requireable<boolean>;
        /**
         * Callback that is triggered on location icon press
         */
        onPress: PropTypes.Requireable<(...args: any[]) => any>;
        /**
         * Callback that is triggered on location update
         */
        onUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        /**
         * Show or hide small arrow which indicates direction the device is pointing relative to north.
         */
        showsUserHeadingIndicator: PropTypes.Requireable<boolean>;
        /**
         * Minimum amount of movement before GPS location is updated in meters
         */
        minDisplacement: PropTypes.Requireable<number>;
        /**
         * Custom location icon of type mapbox-gl-native components
         */
        children: PropTypes.Requireable<any>;
    };
    static defaultProps: {
        animated: boolean;
        visible: boolean;
        showsUserHeadingIndicator: boolean;
        minDisplacement: number;
        renderMode: string;
    };
    static RenderMode: {
        Native: string;
        Normal: string;
    };
    constructor(props: any);
    state: {
        shouldShowUserLocation: boolean;
        coordinates: null;
        heading: null;
    };
    _onLocationUpdate(location: any): void;
    _isMounted: null;
    locationManagerRunning: boolean;
    componentDidMount(): Promise<void>;
    componentDidUpdate(prevProps: any): Promise<void>;
    componentWillUnmount(): Promise<void>;
    /**
     * Whether to start or stop listening to the locationManager
     *
     * Notice, that listening will start automatically when
     * either `onUpdate` or `visible` are set
     *
     * @async
     * @param {Object} running - Object with key `running` and `boolean` value
     * @return {Promise<void>}
     */
    setLocationManager({ running }: any): Promise<void>;
    /**
     *
     * If locationManager should be running
     *
     * @return {boolean}
     */
    needsLocationManagerRunning(): boolean;
    _renderNative(): JSX.Element;
    render(): JSX.Element | null;
}
import React from "react";
import PropTypes from "prop-types";
//# sourceMappingURL=UserLocation.d.ts.map