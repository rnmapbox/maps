import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { NativeModules, requireNativeComponent } from 'react-native';
import { Position } from '@turf/helpers';

import {
  UserTrackingModeChangeCallback,
  CameraAnimationMode,
  CameraFollowConfig,
  CameraStops,
  CameraMinMaxConfig,
  CameraStop,
} from '../types';
import { makeLatLngBounds, makePoint } from '../utils/geoUtils';

const NativeModule = NativeModules.MGLModule;

/**
 * Converts the provided React Native animation mode into the corresponding native enum value.
 */
const nativeAnimationMode = (
  mode?: CameraAnimationMode,
): NativeAnimationMode => {
  const NativeCameraModes = NativeModule.CameraModes;

  switch (mode) {
    case 'flyTo':
      return NativeCameraModes.Flight;
    case 'easeTo':
      return NativeCameraModes.Ease;
    case 'linearTo':
      return NativeCameraModes.Linear;
    case 'moveTo':
      return NativeCameraModes.Move;
    default:
      return NativeCameraModes.Ease;
  }
};

export const NATIVE_MODULE_NAME = 'RCTMGLCamera';

// Native module types.

type NativeAnimationMode = 'flight' | 'ease' | 'linear' | 'none' | 'move';

interface NativeCameraProps extends CameraFollowConfig {
  testID?: string;
  stop: NativeCameraStop | null;
  defaultStop?: NativeCameraStop | null;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  maxBounds?: string | null;
  onUserTrackingModeChange?: UserTrackingModeChangeCallback;
}

interface NativeCameraStop {
  centerCoordinate?: string;
  bounds?: string;
  heading?: number;
  pitch?: number;
  zoom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  duration?: number;
  mode?: NativeAnimationMode;
}

export interface CameraRef {
  setCamera: (config: CameraStop | CameraStops) => void;
  fitBounds: (
    ne: Position,
    sw: Position,
    paddingConfig?: number | number[],
    animationDuration?: number,
  ) => void;
  flyTo: (centerCoordinate: Position, animationDuration?: number) => void;
  moveTo: (centerCoordinate: Position, animationDuration?: number) => void;
  zoomTo: (zoomLevel: number, animationDuration?: number) => void;
}

export interface CameraProps
  extends CameraStop,
    CameraFollowConfig,
    CameraMinMaxConfig {
  /** The configuration that the camera falls back on, if no other values are specified. */
  defaultSettings?: CameraStop;
  /** Whether the camera should send any configuration to the native module. Prevents unnecessary tile
   * fetching and improves performance when the map is not visible. Defaults to `true`. */
  allowUpdates?: boolean;
  /** Any arbitrary primitive value that, when changed, causes the camera to retry moving to its target
   * configuration. (Not yet implemented.) */
  triggerKey?: string | number;
  /** Executes when user tracking mode changes. */
  onUserTrackingModeChange?: UserTrackingModeChangeCallback;
}

/**
 * Controls the perspective from which the user sees the map.
 *
 * To use imperative methods, pass in a ref object:
 *
 * <pre>const camera = useRef<CameraRef>(null);
 *
 * useEffect(() => {
 *   camera.current?.setCamera({
 *     centerCoordinate: [lon, lat],
 *   });
 * }, []);
 *
 * return (
 *   <Camera ref={camera} />
 * );</pre>
 */
const Camera = memo(
  forwardRef((props: CameraProps, ref: React.ForwardedRef<CameraRef>) => {
    const {
      centerCoordinate,
      bounds,
      heading,
      pitch,
      zoomLevel,
      padding,
      animationDuration,
      animationMode,
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

    // @ts-expect-error This avoids a type/value mismatch.
    const nativeCamera = useRef<RCTMGLCamera>(null);

    const nativeDefaultStop = useMemo((): NativeCameraStop | null => {
      if (!defaultSettings) {
        return null;
      }
      const _defaultStop: NativeCameraStop = {
        centerCoordinate: JSON.stringify(defaultSettings.centerCoordinate),
        bounds: JSON.stringify(defaultSettings.bounds),
        heading: defaultSettings.heading ?? 0,
        pitch: defaultSettings.pitch ?? 0,
        zoom: defaultSettings.zoomLevel ?? 11,
        paddingTop: defaultSettings.padding?.paddingTop ?? 0,
        paddingBottom: defaultSettings.padding?.paddingBottom ?? 0,
        paddingLeft: defaultSettings.padding?.paddingLeft ?? 0,
        paddingRight: defaultSettings.padding?.paddingRight ?? 0,
        duration: defaultSettings.animationDuration ?? 2000,
        mode: nativeAnimationMode(defaultSettings.animationMode),
      };
      return _defaultStop;
    }, [defaultSettings]);

    const buildNativeStop = useCallback(
      (
        stop: CameraStop,
        ignoreFollowUserLocation = false,
      ): NativeCameraStop | null => {
        stop = {
          ...stop,
          type: 'CameraStop',
        };

        if (props.followUserLocation && !ignoreFollowUserLocation) {
          return null;
        }

        const _nativeStop: NativeCameraStop = { ...nativeDefaultStop };

        if (stop.pitch !== undefined) _nativeStop.pitch = stop.pitch;
        if (stop.heading !== undefined) _nativeStop.heading = stop.heading;
        if (stop.zoomLevel !== undefined) _nativeStop.zoom = stop.zoomLevel;
        if (stop.animationMode !== undefined)
          _nativeStop.mode = nativeAnimationMode(stop.animationMode);
        if (stop.animationDuration !== undefined)
          _nativeStop.duration = stop.animationDuration;

        if (stop.centerCoordinate) {
          _nativeStop.centerCoordinate = JSON.stringify(
            makePoint(stop.centerCoordinate),
          );
        }

        if (stop.bounds && stop.bounds.ne && stop.bounds.sw) {
          const { ne, sw } = stop.bounds;
          _nativeStop.bounds = JSON.stringify(makeLatLngBounds(ne, sw));
        }

        _nativeStop.paddingTop =
          stop.padding?.paddingTop ?? stop.bounds?.paddingTop ?? 0;
        _nativeStop.paddingRight =
          stop.padding?.paddingRight ?? stop.bounds?.paddingRight ?? 0;
        _nativeStop.paddingBottom =
          stop.padding?.paddingBottom ?? stop.bounds?.paddingBottom ?? 0;
        _nativeStop.paddingLeft =
          stop.padding?.paddingLeft ?? stop.bounds?.paddingLeft ?? 0;

        return _nativeStop;
      },
      [props.followUserLocation, nativeDefaultStop],
    );

    const nativeStop = useMemo(() => {
      return buildNativeStop({
        type: 'CameraStop',
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

    const nativeMaxBounds = useMemo(() => {
      if (!maxBounds?.ne || !maxBounds?.sw) {
        return null;
      }
      return JSON.stringify(makeLatLngBounds(maxBounds.ne, maxBounds.sw));
    }, [maxBounds]);

    const _setCamera: CameraRef['setCamera'] = (config) => {
      if (!allowUpdates) {
        return;
      }

      if (!config.type)
        // @ts-expect-error The compiler doesn't understand that the `config` union type is guaranteed
        // to be an object type.
        config = {
          ...config,
          // @ts-expect-error Allows JS files to pass in an invalid config (lacking the `type` property),
          // which would raise a compilation error in TS files.
          type: config.stops ? 'CameraStops' : 'CameraStop',
        };

      if (config.type === 'CameraStops') {
        for (const _stop of config.stops) {
          let _nativeStops: NativeCameraStop[] = [];
          const _nativeStop = buildNativeStop(_stop);
          if (_nativeStop) {
            _nativeStops = [..._nativeStops, _nativeStop];
          }
          nativeCamera.current.setNativeProps({
            stop: { stops: _nativeStops },
          });
        }
      } else if (config.type === 'CameraStop') {
        const _nativeStop = buildNativeStop(config);
        if (_nativeStop) {
          nativeCamera.current.setNativeProps({ stop: _nativeStop });
        }
      }
    };
    const setCamera = useCallback(_setCamera, [allowUpdates, buildNativeStop]);

    const _fitBounds: CameraRef['fitBounds'] = (
      ne,
      sw,
      paddingConfig = 0,
      _animationDuration = 0,
    ) => {
      let _padding = {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
      };

      if (typeof paddingConfig === 'object') {
        if (paddingConfig.length === 2) {
          _padding = {
            paddingTop: paddingConfig[0],
            paddingBottom: paddingConfig[0],
            paddingLeft: paddingConfig[1],
            paddingRight: paddingConfig[1],
          };
        } else if (paddingConfig.length === 4) {
          _padding = {
            paddingTop: paddingConfig[0],
            paddingBottom: paddingConfig[2],
            paddingLeft: paddingConfig[3],
            paddingRight: paddingConfig[1],
          };
        }
      } else if (typeof paddingConfig === 'number') {
        _padding = {
          paddingTop: paddingConfig,
          paddingBottom: paddingConfig,
          paddingLeft: paddingConfig,
          paddingRight: paddingConfig,
        };
      }

      setCamera({
        type: 'CameraStop',
        bounds: {
          ne,
          sw,
        },
        padding: _padding,
        animationDuration: _animationDuration,
        animationMode: 'easeTo',
      });
    };
    const fitBounds = useCallback(_fitBounds, [setCamera]);

    const _flyTo: CameraRef['flyTo'] = (
      _centerCoordinate,
      _animationDuration = 2000,
    ) => {
      setCamera({
        type: 'CameraStop',
        centerCoordinate: _centerCoordinate,
        animationDuration: _animationDuration,
      });
    };
    const flyTo = useCallback(_flyTo, [setCamera]);

    const _moveTo: CameraRef['moveTo'] = (
      _centerCoordinate,
      _animationDuration = 0,
    ) => {
      setCamera({
        type: 'CameraStop',
        centerCoordinate: _centerCoordinate,
        animationDuration: _animationDuration,
        animationMode: 'easeTo',
      });
    };
    const moveTo = useCallback(_moveTo, [setCamera]);

    const _zoomTo: CameraRef['zoomTo'] = (
      _zoomLevel,
      _animationDuration = 2000,
    ) => {
      setCamera({
        type: 'CameraStop',
        zoomLevel: _zoomLevel,
        animationDuration: _animationDuration,
        animationMode: 'flyTo',
      });
    };
    const zoomTo = useCallback(_zoomTo, [setCamera]);

    useImperativeHandle(ref, () => ({
      /**
       * Sets any camera properties, with default fallbacks if unspecified.
       *
       * @example
       * camera.current?.setCamera({
       *   centerCoordinate: [lon, lat],
       * });
       *
       * @param {CameraStop | CameraStops} config
       */
      setCamera,
      /**
       * Set the camera position to enclose the provided bounds, with optional
       * padding and duration.
       *
       * @example
       * camera.fitBounds([lon, lat], [lon, lat]);
       * camera.fitBounds([lon, lat], [lon, lat], [20, 0], 1000);
       *
       * @param {Position} ne Northeast coordinate of bounding box
       * @param {Position} sw Southwest coordinate of bounding box
       * @param {number | number[]} paddingConfig The viewport padding, specified as a number (all sides equal), a 2-item array ([vertical, horizontal]), or a 4-item array ([top, right, bottom, left])
       * @param {number} animationDuration The transition duration
       */
      fitBounds,
      /**
       * Sets the camera to center around the provided coordinate using a realistic 'travel'
       * animation, with optional duration.
       *
       * @example
       * camera.flyTo([lon, lat]);
       * camera.flyTo([lon, lat], 12000);
       *
       *  @param {Position} centerCoordinate The coordinate to center in the view
       *  @param {number} animationDuration The transition duration
       */
      flyTo,
      /**
       * Sets the camera to center around the provided coordinate, with optional duration.
       *
       * @example
       * camera.moveTo([lon, lat], 200);
       * camera.moveTo([lon, lat]);
       *
       *  @param {Position} centerCoordinate The coordinate to center in the view
       *  @param {number} animationDuration The transition duration
       */
      moveTo,
      /**
       * Zooms the camera to the provided level, with optional duration.
       *
       * @example
       * camera.zoomTo(16);
       * camera.zoomTo(16, 100);
       *
       * @param {number} zoomLevel The target zoom
       * @param {number} animationDuration The transition duration
       */
      zoomTo,
    }));

    return (
      <RCTMGLCamera
        testID={'Camera'}
        ref={nativeCamera}
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
  }),
);

const RCTMGLCamera =
  requireNativeComponent<NativeCameraProps>(NATIVE_MODULE_NAME);

export default Camera;
