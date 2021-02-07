import React, {FC, useState, useEffect, useRef, ReactChild} from 'react';

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

export const normalIcon = (showsUserHeadingIndicator: boolean, heading) => [
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

interface Location {
  coords: Coordinates;
  timestamp?: number;
}

interface Coordinates {
  heading?: number;
  speed?: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
}

interface Props {
  androidRenderMode?: 'normal' | 'compass' | 'gps';
  animated?: boolean;
  children?: ReactChild; // No good :(
  minDisplacement?: number;
  onPress?: () => void;
  onUpdate?: (location: Location) => void;
  renderMode?: 'normal' | 'native';
  showsUserHeadingIndicator?: boolean;
  visible?: boolean;
}

const RENDER_MODE = {
  Native: 'native',
  Normal: 'normal',
};

const UserLocation: FC<Props> = ({
  androidRenderMode,
  animated = true,
  children,
  minDisplacement = 0,
  onPress,
  onUpdate,
  renderMode = 'normal',
  showsUserHeadingIndicator = false,
  visible = true,
}: Props) => {
  const [coordinates, setCoordinates] = useState(null);
  const [heading, setHeading] = useState(null);

  // required as #setLocationManager attempts to setState
  // after component unmount
  const _isMounted = useRef(true);

  let locationManagerRunning: boolean = false;

  // componentDidMount
  useEffect(() => {
    const startLocationManger = async () => {
      await setLocationManager({
        running: needsLocationManagerRunning(),
      });
    };

    startLocationManger();

    if (renderMode === RENDER_MODE.Native) {
      return;
    }

    locationManager.setMinDisplacement(minDisplacement);

    return () => {
      _isMounted.current = false;

      const stopLocationManager = async () => {
        await setLocationManager({running: false});
      };

      stopLocationManager();
    };
  }, []);

  // componentDidUpdate
  useEffect(() => {
    const startLocationManger = async () => {
      await setLocationManager({
        running: needsLocationManagerRunning(),
      });
    };

    startLocationManger();

    locationManager.setMinDisplacement(minDisplacement);
  }, [minDisplacement]);

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
  const setLocationManager = async ({running}) => {
    if (locationManagerRunning !== running) {
      locationManagerRunning = running;
      if (running) {
        locationManager.addListener(_onLocationUpdate);
        const location = await locationManager.getLastKnownLocation();
        _onLocationUpdate(location);
      } else {
        locationManager.removeListener(_onLocationUpdate);
      }
    }
  };

  /**
   *
   * If locationManager should be running
   *
   * @return {boolean}
   */
  const needsLocationManagerRunning = (): boolean => {
    return !!onUpdate || (renderMode === RENDER_MODE.Normal && visible);
  };

  const _onLocationUpdate = (location: Location): void => {
    if (!_isMounted.current || !location) {
      return;
    }

    let updatedCoordinates = null;
    let updatedHeading = null;

    if (location && location.coords) {
      const {longitude, latitude} = location.coords;
      ({heading: updatedHeading} = location.coords);
      updatedCoordinates = [longitude, latitude];
    }

    setCoordinates(updatedCoordinates);
    setHeading(updatedHeading);

    // eslint-disable-next-line no-unused-expressions
    onUpdate && onUpdate(location);
  };

  const _renderNative = () => {
    let nativeProps = {
      androidRenderMode,
      iosShowsUserHeadingIndicator: showsUserHeadingIndicator,
    };
    return <NativeUserLocation {...nativeProps} />;
  };

  if (!visible) {
    return null;
  }

  if (renderMode === RENDER_MODE.Native) {
    return _renderNative();
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
};

export default UserLocation;
