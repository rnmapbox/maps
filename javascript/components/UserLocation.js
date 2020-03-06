import React from 'react';
import PropTypes from 'prop-types';

import locationManager from '../modules/location/locationManager';

import Annotation from './annotations/Annotation'; // eslint-disable-line import/no-cycle
import CircleLayer from './CircleLayer';

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

const normalIcon = [
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
];

class UserLocation extends React.Component {
  static propTypes = {
    /**
     * Whether location icon is animated between updates
     */
    animated: PropTypes.bool,

    /**
     * Rendermode of user location icon.
     * One of `"normal"`, `"custom"`.
     * "custom" must be of type mapbox-gl-native components
     */
    renderMode: PropTypes.oneOf(['normal', 'custom']),

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

    minDisplacement: PropTypes.number,

    /**
     * Custom location icon of type mapbox-gl-native components
     */
    children: PropTypes.any,
  };

  static defaultProps = {
    animated: true,
    visible: true,
    minDisplacement: 0,
    renderMode: 'normal',
  };

  static RenderMode = {
    Normal: 'normal',
    Custom: 'custom',
  };

  constructor(props) {
    super(props);

    this.state = {
      shouldShowUserLocation: false,
      coordinates: null,
    };

    this._onLocationUpdate = this._onLocationUpdate.bind(this);
  }

  async componentDidMount() {
    this._isMounted = true;
    locationManager.addListener(this._onLocationUpdate);
    await this.setLocationManager({
      running: this.needsLocationManagerRunning(),
    });

    locationManager.setMinDisplacement(this.props.minDisplacement);
  }

  locationManagerRunning = false;

  /**
   * Whether to start or stop the locationManager
   *
   * Notice, that locationManager will start automatically when
   * either `onUpdate` or `visible` are set
   *
   * @param {Object} running - Object with key `running` and `boolean` value
   * @return {void}
   */
  setLocationManager = async ({running}) => {
    if (this.locationManagerRunning !== running) {
      this.locationManagerRunning = running;
      if (running) {
        locationManager.start();

        const lastKnownLocation = await locationManager.getLastKnownLocation();

        if (lastKnownLocation && this._isMounted) {
          this.setState({
            coordinates: this._getCoordinatesFromLocation(lastKnownLocation),
          });
        }
      } else if (!running) {
        locationManager.dispose();
      }
    }
  };

  /**
   *
   * If locationManager should be running
   *
   * @return {boolean}
   */
  needsLocationManagerRunning() {
    return !!this.props.onUpdate || this.props.visible;
  }

  async componentWillUnmount() {
    this._isMounted = false;

    locationManager.removeListener(this._onLocationUpdate);
    await this.setLocationManager({running: false});
  }

  _onLocationUpdate(location) {
    this.setState({
      coordinates: this._getCoordinatesFromLocation(location),
    });

    if (this.props.onUpdate) {
      this.props.onUpdate(location);
    }
  }

  _getCoordinatesFromLocation(location) {
    if (!location || !location.coords) {
      return;
    }
    return [location.coords.longitude, location.coords.latitude];
  }

  _userIconLayers() {
    switch (this.props.renderMode) {
      case UserLocation.RenderMode.Normal:
        return normalIcon;
      default:
        return this.props.children;
    }
  }

  async componentDidUpdate(prevProps) {
    await this.setLocationManager({
      running: this.needsLocationManagerRunning(),
    });

    if (this.props.minDisplacement !== prevProps.minDisplacement) {
      locationManager.setMinDisplacement(this.props.minDisplacement);
    }
  }

  render() {
    if (!this.props.visible || !this.state.coordinates) {
      return null;
    }

    const children = this.props.children
      ? this.props.children
      : this._userIconLayers();

    return (
      <Annotation
        animated={this.props.animated}
        id="mapboxUserLocation"
        onPress={this.props.onPress}
        coordinates={this.state.coordinates}
      >
        {children}
      </Annotation>
    );
  }
}

export default UserLocation;

// TODO:
// * why is there even a RenderMode if children are rendered regardless?
// * why is #userIconLayers a getter?!
// * state.shouldShowUserLocation is unused
