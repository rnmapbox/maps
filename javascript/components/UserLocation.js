import React from 'react';
import PropTypes from 'prop-types';

import locationManager from '../modules/location/locationManager';

import Annotation from './annotations/Annotation';
import CircleLayer from './CircleLayer';
import HeadingIndicator from './HeadingIndicator';
import NativeUserLocation from './NativeUserLocation';

const mapboxBlue = 'rgba(51, 181, 229, 100)';

const layerStyles = {
  normal: {
    pluse: {
      circleRadius: 15,
      circleColor: mapboxBlue,
      circleOpacity: 0.2,
      circlePitchAlignment: 'map',
    },
    background: {
      circleRadius: 9,
      circleColor: '#fff',
      circlePitchAlignment: 'map',
    },
    foreground: {
      circleRadius: 6,
      circleColor: mapboxBlue,
      circlePitchAlignment: 'map',
    },
  },
};

export const normalIcon = (showsUserHeadingIndicator, heading) => [
  <CircleLayer
    key="mapboxUserLocationPluseCircle"
    id="mapboxUserLocationPluseCircle"
    style={layerStyles.normal.pluse}
  />,
  <CircleLayer
    key="mapboxUserLocationWhiteCircle"
    id="mapboxUserLocationWhiteCircle"
    style={layerStyles.normal.background}
  />,
  <CircleLayer
    key="mapboxUserLocationBlueCicle"
    id="mapboxUserLocationBlueCicle"
    aboveLayerID="mapboxUserLocationWhiteCircle"
    style={layerStyles.normal.foreground}
  />,
  ...(showsUserHeadingIndicator && heading !== null
    ? [HeadingIndicator(heading)]
    : []),
];

class UserLocation extends React.Component {
  static propTypes = {
    /**
     * Whether location icon is animated between updates
     */
    animated: PropTypes.bool,

    /**
     * Which render mode to use.
     * Can either be `normal` or `native`
     */
    renderMode: PropTypes.oneOf(['normal', 'native']),

    /**
     * native/android only render mode
     *
     *  - normal: just a circle
     *  - compass: triangle with heading
     *  - gps: large arrow
     *
     * @platform android
     */
    androidRenderMode: PropTypes.oneOf(['normal', 'compass', 'gps']),

    /**
     * Whether location icon is visible
     */
    visible: PropTypes.bool,

    /**
     * Callback that is triggered on location icon press
     */
    onPress: PropTypes.func,

    /**
     * Callback that is triggered on location update
     */
    onUpdate: PropTypes.func,

    /**
     * Show or hide small arrow which indicates direction the device is pointing relative to north.
     */
    showsUserHeadingIndicator: PropTypes.bool,

    /**
     * Minimum amount of movement before GPS location is updated in meters
     */
    minDisplacement: PropTypes.number,

    /**
     * Custom location icon of type mapbox-gl-native components
     */
    children: PropTypes.any,
  };

  static defaultProps = {
    animated: true,
    visible: true,
    showsUserHeadingIndicator: false,
    minDisplacement: 0,
    renderMode: 'normal',
  };

  static RenderMode = {
    Native: 'native',
    Normal: 'normal',
  };

  constructor(props) {
    super(props);

    this.state = {
      shouldShowUserLocation: false,
      coordinates: null,
      heading: null,
    };

    this._onLocationUpdate = this._onLocationUpdate.bind(this);
  }

  // required as #setLocationManager attempts to setState
  // after component unmount
  _isMounted = null;

  locationManagerRunning = false;

  async componentDidMount() {
    this._isMounted = true;

    await this.setLocationManager({
      running: this.needsLocationManagerRunning(),
    });

    if (this.renderMode === UserLocation.RenderMode.Native) {
      return;
    }

    locationManager.setMinDisplacement(this.props.minDisplacement);
  }

  async componentDidUpdate(prevProps) {
    await this.setLocationManager({
      running: this.needsLocationManagerRunning(),
    });

    if (this.props.minDisplacement !== prevProps.minDisplacement) {
      locationManager.setMinDisplacement(this.props.minDisplacement);
    }
  }

  async componentWillUnmount() {
    this._isMounted = false;
    await this.setLocationManager({ running: false });
  }

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
  async setLocationManager({ running }) {
    if (this.locationManagerRunning !== running) {
      this.locationManagerRunning = running;
      if (running) {
        locationManager.addListener(this._onLocationUpdate);
        const location = await locationManager.getLastKnownLocation();
        this._onLocationUpdate(location);
      } else {
        locationManager.removeListener(this._onLocationUpdate);
      }
    }
  }

  /**
   *
   * If locationManager should be running
   *
   * @return {boolean}
   */
  needsLocationManagerRunning() {
    return (
      !!this.props.onUpdate ||
      (this.props.renderMode === UserLocation.RenderMode.Normal &&
        this.props.visible)
    );
  }

  _onLocationUpdate(location) {
    if (!this._isMounted || !location) {
      return;
    }
    let coordinates = null;
    let heading = null;

    if (location && location.coords) {
      const { longitude, latitude } = location.coords;
      ({ heading } = location.coords);
      coordinates = [longitude, latitude];
    }

    this.setState({
      coordinates,
      heading,
    });

    if (this.props.onUpdate) {
      this.props.onUpdate(location);
    }
  }

  _renderNative() {
    const { androidRenderMode, showsUserHeadingIndicator } = this.props;

    let props = {
      androidRenderMode,
      iosShowsUserHeadingIndicator: showsUserHeadingIndicator,
    };
    return <NativeUserLocation {...props} />;
  }

  render() {
    const { heading, coordinates } = this.state;
    const { children, visible, showsUserHeadingIndicator, onPress, animated } =
      this.props;

    if (!visible) {
      return null;
    }

    if (this.props.renderMode === UserLocation.RenderMode.Native) {
      return this._renderNative();
    }

    if (!coordinates) {
      return null;
    }

    return (
      <Annotation
        animated={animated}
        id="mapboxUserLocation"
        onPress={onPress}
        coordinates={coordinates}
        style={{
          iconRotate: heading,
        }}
      >
        {children || normalIcon(showsUserHeadingIndicator, heading)}
      </Annotation>
    );
  }
}

export default UserLocation;
