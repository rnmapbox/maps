import React from 'react';
import PropTypes from 'prop-types';
import {NativeModules, requireNativeComponent} from 'react-native';

import {viewPropTypes} from '../utils';
import locationManager from '../modules/location/locationManager';

import Annotation from './annotations/Annotation';
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

const compassIcon = null;
const navigationIcon = null;

class UserLocation extends React.Component {
  static propTypes = {
    animated: PropTypes.bool,

    renderMode: PropTypes.oneOf(['normal', 'custom']),

    visible: PropTypes.bool,

    onPress: PropTypes.func,
    onUpdate: PropTypes.func,

    children: PropTypes.any,
  };

  static defaultProps = {
    animated: true,
    visible: true,
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
    locationManager.addListener(this._onLocationUpdate);
    await this.setLocationManager({
      running: this.needsLocationManagerRunning(),
    });
  }

  locationManagerRunning = false;

  setLocationManager = async ({running}) => {
    if (this.locationManagerRunning !== running) {
      this.locationManagerRunning = running;
      if (running) {
        locationManager.start();

        const lastKnownLocation = await locationManager.getLastKnownLocation();

        if (lastKnownLocation) {
          this.setState({
            coordinates: this._getCoordinatesFromLocation(lastKnownLocation),
          });
        }
      }
    }
  };

  needsLocationManagerRunning() {
    return this.props.onUpdate || this.props.visible;
  }

  async componentWillUnmount() {
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

  get userIconLayers() {
    switch (this.props.renderMode) {
      case UserLocation.RenderMode.Normal:
        return normalIcon;
      default:
        return this.props.children;
    }
  }

  async componentDidUpdate() {
    await this.setLocationManager({
      running: this.needsLocationManagerRunning(),
    });
  }

  render() {
    if (!this.props.visible || !this.state.coordinates) {
      return null;
    }

    const children = this.props.children
      ? this.props.children
      : this.userIconLayers;
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
