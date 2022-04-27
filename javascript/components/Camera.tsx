import React, { memo, useCallback, useMemo, useRef } from 'react';
import { Position } from 'geojson';
import { NativeModules, requireNativeComponent } from 'react-native';

import * as geoUtils from '../utils/geoUtils';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLCamera';

const Mode = {
  Flight: 'flyTo',
  Ease: 'easeTo',
  Linear: 'linearTo',
  None: 'none',
  Move: 'moveTo',
};

export const UserTrackingModes = {
  Follow: 'normal',
  FollowWithHeading: 'compass',
  FollowWithCourse: 'course',
};

type AnimationMode = 'flyTo' | 'easeTo' | 'linearTo' | 'none' | 'moveTo';

interface CameraStop {
  centerCoordinate: Position;
  bounds: {
    ne: Position;
    sw: Position;
    paddingLeft?: number; // deprecated
    paddingRight?: number; // deprecated
    paddingTop?: number; // deprecated
    paddingBottom?: number; // deprecated
  };
  heading: number;
  pitch: number;
  zoomLevel: number;
  padding: {
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
  };
  animationDuration: number;
  animationMode: AnimationMode;
}

interface CameraFollowConfig {
  followUserLocation: boolean;
  followUserMode?: 'normal' | 'compass' | 'course';
  followZoomLevel?: number;
  followPitch?: number;
  followHeading?: number;
}

interface CameraMinMaxConfig {
  minZoomLevel: number;
  maxZoomLevel: number;
  maxBounds: {
    ne: Position;
    sw: Position;
  };
}

/**
 * @param {Position} centerCoordinate
 * @param {TODO} bounds
 * @param {number} heading
 * @param {number} pitch
 * @param {number} zoomLevel
 * @param {TODO} padding
 * @param {number} animationDuration
 * @param {AnimationMode} animationMode
 * @param {boolean} followUserLocation
 * @param {'normal' | 'compass' | 'course'} followUserMode
 * @param {number} followZoomLevel
 * @param {number} followPitch
 * @param {number} followHeading
 * @param {number} minZoomLevel
 * @param {number} maxZoomLevel
 * @param {TODO} maxBounds
 */
interface CameraProps
  extends CameraStop,
    CameraFollowConfig,
    CameraMinMaxConfig {
  defaultSettings?: CameraStop;
  allowUpdates: boolean;
  triggerKey: any;
  onUserTrackingModeChange: () => void;
}

/**
 * @param {CameraProps} props
 */
const Camera = memo((props: CameraProps) => {
  const {
    centerCoordinate,
    bounds,
    heading,
    pitch,
    zoomLevel,
    padding,
    animationDuration = 2000,
    animationMode = 'easeTo',
    minZoomLevel,
    maxZoomLevel,
    maxBounds,
    followUserLocation,
    followUserMode,
    followZoomLevel,
    followPitch,
    followHeading,
    defaultSettings,
    allowUpdates = true,
    triggerKey,
    onUserTrackingModeChange,
  } = props;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const camera: React.RefObject<RCTMGLCamera> = useRef(null);

  /**
   * Map camera transitions to fit provided bounds
   *
   * @example
   * camera.fitBounds([lng, lat], [lng, lat])
   * camera.fitBounds([lng, lat], [lng, lat], 20, 1000) // padding for all sides
   * camera.fitBounds([lng, lat], [lng, lat], [verticalPadding, horizontalPadding], 1000)
   * camera.fitBounds([lng, lat], [lng, lat], [top, right, bottom, left], 1000)
   *
   * @param {Array<Number>} northEastCoordinates - North east coordinate of bound
   * @param {Array<Number>} southWestCoordinates - South west coordinate of bound
   * @param {Number=} padding - Camera padding for bound
   * @param {Number=} animationDuration - Duration of camera animation
   * @return {void}
   */
  // const fitBounds = (
  //   northEastCoordinates: Position,
  //   southWestCoordinates: Position,
  //   padding = 0,
  //   animationDuration = 0.0,
  // ) => {
  //   const pad = {
  //     paddingLeft: 0,
  //     paddingRight: 0,
  //     paddingTop: 0,
  //     paddingBottom: 0,
  //   };

  //   if (Array.isArray(padding)) {
  //     if (padding.length === 2) {
  //       pad.paddingTop = padding[0];
  //       pad.paddingBottom = padding[0];
  //       pad.paddingLeft = padding[1];
  //       pad.paddingRight = padding[1];
  //     } else if (padding.length === 4) {
  //       pad.paddingTop = padding[0];
  //       pad.paddingRight = padding[1];
  //       pad.paddingBottom = padding[2];
  //       pad.paddingLeft = padding[3];
  //     }
  //   } else {
  //     pad.paddingLeft = padding;
  //     pad.paddingRight = padding;
  //     pad.paddingTop = padding;
  //     pad.paddingBottom = padding;
  //   }

  //   return setCamera({
  //     bounds: {
  //       ne: northEastCoordinates,
  //       sw: southWestCoordinates,
  //     },
  //     padding: pad,
  //     animationDuration,
  //     animationMode: Mode.Ease,
  //   });
  // };

  /**
   * Map camera will fly to new coordinate
   *
   * @example
   * camera.flyTo([lng, lat])
   * camera.flyTo([lng, lat], 12000)
   *
   *  @param {Array<Number>} coordinates - Coordinates that map camera will jump too
   *  @param {Number=} animationDuration - Duration of camera animation
   *  @return {void}
   */
  // const flyTo = (coordinates: Position, animationDuration = 2000) => {
  //   return setCamera({
  //     centerCoordinate: coordinates,
  //     animationDuration,
  //     animationMode: Mode.Flight,
  //   });
  // };

  /**
   * Map camera will move to new coordinate at the same zoom level
   *
   * @example
   * camera.moveTo([lng, lat], 200) // eases camera to new location based on duration
   * camera.moveTo([lng, lat]) // snaps camera to new location without any easing
   *
   *  @param {Array<Number>} coordinates - Coordinates that map camera will move too
   *  @param {Number=} animationDuration - Duration of camera animation
   *  @return {void}
   */
  // const moveTo = (coordinates: Position, animationDuration = 0) => {
  //   return setCamera({
  //     centerCoordinate: coordinates,
  //     animationDuration,
  //   });
  // };

  /**
   * Map camera will zoom to specified level
   *
   * @example
   * camera.zoomTo(16)
   * camera.zoomTo(16, 100)
   *
   * @param {Number} zoomLevel - Zoom level that the map camera will animate too
   * @param {Number=} animationDuration - Duration of camera animation
   * @return {void}
   */
  // const zoomTo = (zoomLevel: number, animationDuration = 2000) => {
  //   return setCamera({
  //     zoomLevel,
  //     animationDuration,
  //     animationMode: Mode.Flight,
  //   });
  // };

  /**
   * Map camera will perform updates based on provided config. Advanced use only!
   *
   * @example
   * camera.setCamera({
   *   centerCoordinate: [lng, lat],
   *   zoomLevel: 16,
   *   animationDuration: 2000,
   * })
   *
   * camera.setCamera({
   *   stops: [
   *     { pitch: 45, animationDuration: 200 },
   *     { heading: 180, animationDuration: 300 },
   *   ]
   * })
   *
   *  @param {Object} config - Camera configuration
   */
  // const setCamera = (config: CameraStop) => {
  //   _setCamera(config);
  // };

  // const _setCamera = (config = {}) => {
  //   let cameraConfig = {};

  //   if (config.stops) {
  //     cameraConfig.stops = [];

  //     for (const stop of config.stops) {
  //       cameraConfig.stops.push(_createStop(stop));
  //     }
  //   } else {
  //     cameraConfig = _createStop(config);
  //   }

  //   refs.camera.setNativeProps({ stop: cameraConfig });
  // }

  const nativeAnimationMode = useCallback((_mode: AnimationMode) => {
    switch (_mode) {
      case Mode.Flight:
        return MapboxGL.CameraModes.Flight;
      case Mode.Ease:
        return MapboxGL.CameraModes.Ease;
      case Mode.Linear:
        return MapboxGL.CameraModes.Linear;
      case Mode.None:
        return MapboxGL.CameraModes.None;
      case Mode.Move:
      default:
        return MapboxGL.CameraModes.Move;
    }
  }, []);

  const buildNativeStop = useCallback(
    (
      stop: CameraStop,
      ignoreFollowUserLocation = false,
    ): NativeCameraStop | null => {
      if (props.followUserLocation && !ignoreFollowUserLocation) {
        return null;
      }

      const stopConfig: NativeCameraStop = {
        mode: nativeAnimationMode(stop.animationMode),
        pitch: stop.pitch,
        heading: stop.heading,
        duration: stop.animationDuration ?? 0,
        zoom: stop.zoomLevel,
      };

      if (stop.centerCoordinate) {
        stopConfig.centerCoordinate = JSON.stringify(
          geoUtils.makePoint(stop.centerCoordinate),
        );
      }

      if (stop.bounds && stop.bounds.ne && stop.bounds.sw) {
        const { ne, sw } = stop.bounds;
        stopConfig.bounds = JSON.stringify(geoUtils.makeLatLngBounds(ne, sw));
      }

      stopConfig.paddingTop =
        stop.padding?.paddingTop ?? stop.bounds?.paddingTop ?? 0;
      stopConfig.paddingRight =
        stop.padding?.paddingRight ?? stop.bounds?.paddingRight ?? 0;
      stopConfig.paddingBottom =
        stop.padding?.paddingBottom ?? stop.bounds?.paddingBottom ?? 0;
      stopConfig.paddingLeft =
        stop.padding?.paddingLeft ?? stop.bounds?.paddingLeft ?? 0;

      return stopConfig;
    },
    [props.followUserLocation, nativeAnimationMode],
  );

  const nativeMaxBounds = useMemo(() => {
    if (!maxBounds?.ne || !maxBounds?.sw) {
      return null;
    }
    return JSON.stringify(
      geoUtils.makeLatLngBounds(maxBounds.ne, maxBounds.sw),
    );
  }, [maxBounds]);

  const nativeStop = useMemo(() => {
    return buildNativeStop({
      centerCoordinate,
      bounds,
      heading,
      pitch,
      zoomLevel,
      padding,
      animationDuration,
      animationMode,
    });
  }, [
    centerCoordinate,
    bounds,
    heading,
    pitch,
    zoomLevel,
    padding,
    animationDuration,
    animationMode,
    buildNativeStop,
  ]);

  const nativeDefaultStop = useMemo((): NativeCameraStop | null => {
    if (!defaultSettings) {
      return null;
    }
    return buildNativeStop(defaultSettings);
  }, [defaultSettings, buildNativeStop]);

  return (
    <RCTMGLCamera
      testID={'Camera'}
      ref={camera}
      stop={nativeStop}
      defaultStop={nativeDefaultStop}
      followUserLocation={followUserLocation}
      followUserMode={followUserMode}
      followPitch={followPitch}
      followHeading={followHeading}
      followZoomLevel={followZoomLevel}
      minZoomLevel={minZoomLevel}
      maxZoomLevel={maxZoomLevel}
      maxBounds={nativeMaxBounds}
      onUserTrackingModeChange={onUserTrackingModeChange}
    />
  );
});

interface NativeCameraProps extends CameraFollowConfig {
  testID: string;
  stop: NativeCameraStop | null;
  defaultStop: NativeCameraStop | null;
  minZoomLevel: number;
  maxZoomLevel: number;
  maxBounds: string | null;
  onUserTrackingModeChange: () => void;
}

interface NativeCameraStop {
  centerCoordinate?: string;
  bounds?: string;
  heading: number;
  pitch: number;
  zoom: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  duration: number;
  mode: AnimationMode;
}

const RCTMGLCamera =
  requireNativeComponent<NativeCameraProps>(NATIVE_MODULE_NAME);

export default Camera;
