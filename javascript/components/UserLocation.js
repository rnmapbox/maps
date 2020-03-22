import React from 'react';
import PropTypes from 'prop-types';

import locationManager from '../modules/location/locationManager';
import headingIcon from '../../assets/heading.png';

import Annotation from './annotations/Annotation'; // eslint-disable-line import/no-cycle
import CircleLayer from './CircleLayer';
import SymbolLayer from './SymbolLayer';

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
    headingIndicator: {
      iconImage: headingIcon,
      iconAllowOverlap: true,
      iconPitchAlignment: 'map',
    },
  },
};

export const headingIndicator = heading => (
  <SymbolLayer
    key="mapboxUserLocationHeadingIndicator"
    id="mapboxUserLocationHeadingIndicator"
    belowLayerID="mapboxUserLocationWhiteCircle"
    style={{
      iconRotate: heading,
      ...layerStyles.normal.headingIndicator,
    }}
  />
);

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
  ...(showsUserHeadingIndicator && heading ? [headingIndicator(heading)] : []),
];

class UserLocation extends React.Component {
  static propTypes = {
    /**
     * Whether location icon is animated between updates
     */
    animated: PropTypes.bool,

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

    locationManager.addListener(this._onLocationUpdate);
    await this.setLocationManager({
      running: this.needsLocationManagerRunning(),
    });

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
    locationManager.removeListener(this._onLocationUpdate);
    await this.setLocationManager({running: false});
  }

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

        const location = await locationManager.getLastKnownLocation();
        this._onLocationUpdate(location);
      } else {
        locationManager.stop();
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

  _onLocationUpdate(location) {
    if (!this._isMounted) {
      return;
    }
    let coordinates = null;
    let heading = null;

    if (location && location.coords) {
      const {longitude, latitude} = location.coords;
      coordinates = [longitude, latitude];
      heading = location.coords.heading;
    }

    this.setState({
      coordinates,
      heading,
    });

    if (this.props.onUpdate) {
      this.props.onUpdate(location);
    }
  }

  render() {
    const {heading, coordinates} = this.state;
    const {
      children,
      visible,
      showsUserHeadingIndicator,
      onPress,
      animated,
    } = this.props;

    if (!visible || !coordinates) {
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
