import React, { ReactElement } from 'react';

import locationManager from '../modules/location/locationManager';
import { type Location } from '../modules/location/locationManager';
import { CircleLayerStyle } from '../Mapbox';

import Annotation from './Annotation';
import CircleLayer from './CircleLayer';
import HeadingIndicator from './HeadingIndicator';
import LocationPuck from './LocationPuck';

const mapboxBlue = 'rgba(51, 181, 229, 100)';

const layerStyles: Record<'normal', Record<string, CircleLayerStyle>> = {
  normal: {
    pulse: {
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

const normalIcon = (
  showsUserHeadingIndicator?: boolean,
  heading?: number | null,
): ReactElement[] => [
  <CircleLayer
    key="mapboxUserLocationPulseCircle"
    id="mapboxUserLocationPulseCircle"
    style={layerStyles.normal.pulse}
  />,
  <CircleLayer
    key="mapboxUserLocationWhiteCircle"
    id="mapboxUserLocationWhiteCircle"
    style={layerStyles.normal.background}
  />,
  <CircleLayer
    key="mapboxUserLocationBlueCircle"
    id="mapboxUserLocationBlueCircle"
    aboveLayerID="mapboxUserLocationWhiteCircle"
    style={layerStyles.normal.foreground}
  />,
  ...(showsUserHeadingIndicator && typeof heading === 'number'
    ? [
        <HeadingIndicator
          heading={heading}
          key="mapboxUserLocationHeadingIndicator"
        />,
      ]
    : []),
];

export enum UserLocationRenderMode {
  Native = 'native',
  Normal = 'normal',
}

type Props = {
  /**
   * native/android only render mode
   *
   *  - normal: just a circle
   *  - compass: triangle with heading
   *  - gps: large arrow
   *
   * @platform android
   */
  androidRenderMode?: 'normal' | 'compass' | 'gps';

  /**
   * Whether location icon is animated between updates
   */
  animated?: boolean;

  /**
   * Custom location icon of type mapbox-gl-native components
   */
  children?: ReactElement | ReactElement[];

  /**
   * Minimum distance in meters the device must move before a location update is generated.
   * Maps to `distanceFilter` on iOS and `displacement` on Android. Defaults to 0.
   */
  minDisplacement?: number;

  /**
   * Callback that is triggered on location icon press
   */
  onPress?: () => void;

  /**
   * Callback that is triggered on each location update. Receives a {@link Location} object
   * containing `coords` (latitude, longitude, altitude, accuracy, heading, course, speed)
   * and `timestamp`.
   */
  onUpdate?: (location: Location) => void;

  /**
   * @deprecated use LocationPuck component instead of UserLocationRenderMode.Native
   * Which render mode to use.
   */
  renderMode?: UserLocationRenderMode;

  /**
   * Request the always location permission, and listen to the location even when the app is in background.
   *
   * **Note:** This is not implemented in Mapbox Maps SDK v11 and is currently a no-op
   * on both iOS and Android.
   *
   * @platform ios
   */
  requestsAlwaysUse?: boolean;

  /**
   * Show or hide small arrow which indicates direction the device is pointing relative to north.
   */
  showsUserHeadingIndicator?: boolean;

  /**
   * Whether location icon is visible
   */
  visible?: boolean;
};

type UserLocationState = {
  shouldShowUserLocation: false;
  coordinates: number[] | null;
  heading: number | null;
};

/**
 * Displays the user's current location on the map with a customizable appearance.
 *
 * By default, renders a blue circle indicator. Provide children (layer components) to
 * customize the appearance. Uses `locationManager` internally to subscribe to location
 * updates, with automatic start/stop on mount/unmount and background/foreground transitions.
 *
 * For a simpler native-rendered location indicator, consider using {@link LocationPuck} directly.
 */
class UserLocation extends React.Component<Props, UserLocationState> {
  static defaultProps = {
    animated: true,
    visible: true,
    showsUserHeadingIndicator: false,
    requestsAlwaysUse: false,
    minDisplacement: 0,
    renderMode: UserLocationRenderMode.Normal,
  };

  constructor(props: Props) {
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
  _isMounted?: boolean = undefined;

  locationManagerRunning?: boolean = false;

  async componentDidMount() {
    this._isMounted = true;

    locationManager.setMinDisplacement(this.props.minDisplacement || 0);

    await this.setLocationManager({
      running: this.needsLocationManagerRunning(),
    });

    if (this.props.renderMode === UserLocationRenderMode.Native) {
      return;
    }
  }

  async componentDidUpdate(prevProps: Props) {
    await this.setLocationManager({
      running: this.needsLocationManagerRunning(),
    });

    if (this.props.minDisplacement !== prevProps.minDisplacement) {
      locationManager.setMinDisplacement(this.props.minDisplacement || 0);
    }
    if (this.props.requestsAlwaysUse !== prevProps.requestsAlwaysUse) {
      locationManager.setRequestsAlwaysUse(
        this.props.requestsAlwaysUse || false,
      );
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
  async setLocationManager({ running }: { running?: boolean }) {
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
      (this.props.renderMode === UserLocationRenderMode.Normal &&
        this.props.visible)
    );
  }

  _onLocationUpdate(location: Location | null) {
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
      heading: heading ?? null,
    });

    if (this.props.onUpdate) {
      this.props.onUpdate(location);
    }
  }

  _renderNative() {
    const { androidRenderMode, showsUserHeadingIndicator } = this.props;

    const props: React.ComponentProps<typeof LocationPuck> = {
      androidRenderMode,
      puckBearingEnabled: showsUserHeadingIndicator,
      puckBearing: showsUserHeadingIndicator ? 'heading' : undefined,
    };
    return <LocationPuck {...props} />;
  }

  render() {
    const { heading, coordinates } = this.state;
    const { children, visible, showsUserHeadingIndicator, onPress, animated } =
      this.props;

    if (!visible) {
      return null;
    }

    if (this.props.renderMode === UserLocationRenderMode.Native) {
      return this._renderNative();
    }

    if (!coordinates) {
      return null;
    }

    return (
      <Annotation
        id="mapboxUserLocation"
        animated={animated}
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
