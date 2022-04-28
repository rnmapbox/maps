import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { NativeModules, requireNativeComponent } from 'react-native';
import { Position } from 'geojson';
import { MapboxGLEvent } from '@rnmapbox/maps';

import * as geoUtils from '../utils/geoUtils';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLCamera';

const Mode: Record<string, AnimationMode> = {
  Flight: 'flyTo',
  Ease: 'easeTo',
  Linear: 'linearTo',
  None: 'none',
  Move: 'moveTo',
};

export const UserTrackingModes: Record<string, UserTrackingMode> = {
  Follow: 'normal',
  FollowWithHeading: 'compass',
  FollowWithCourse: 'course',
};

// Component types.

export type AnimationMode = 'flyTo' | 'easeTo' | 'linearTo' | 'none' | 'moveTo';

type UserTrackingMode = 'normal' | 'compass' | 'course';

type UserTrackingModeChangeCallback = (
  event: MapboxGLEvent<
    'usertrackingmodechange',
    {
      followUserLocation: boolean;
      followUserMode: UserTrackingMode | null;
    }
  >,
) => void;

/**
 * @param {Position} centerCoordinate
 * @param {CameraBounds} bounds
 * @param {number} heading
 * @param {number} pitch
 * @param {number} zoomLevel
 * @param {CameraPadding} padding
 * @param {number} animationDuration
 * @param {AnimationMode} animationMode
 * @param {boolean} followUserLocation
 * @param {UserTrackingMode} followUserMode
 * @param {number} followZoomLevel
 * @param {number} followPitch
 * @param {number} followHeading
 * @param {number} minZoomLevel
 * @param {number} maxZoomLevel
 * @param {CameraBounds} maxBounds
 */
interface CameraProps
  extends Omit<CameraStop, 'type'>,
    CameraFollowConfig,
    CameraMinMaxConfig {
  defaultSettings?: CameraStop;
  allowUpdates?: boolean;
  triggerKey?: any;
  onUserTrackingModeChange?: UserTrackingModeChangeCallback;
}

interface CameraStop {
  readonly type?: 'CameraStop';
  centerCoordinate?: Position;
  bounds?: CameraBoundsWithPadding; // With padding for backwards compatibility.
  heading?: number;
  pitch?: number;
  zoomLevel?: number;
  padding?: CameraPadding;
  animationDuration?: number;
  animationMode?: AnimationMode;
}

interface CameraFollowConfig {
  followUserLocation?: boolean;
  followUserMode?: UserTrackingMode;
  followZoomLevel?: number;
  followPitch?: number;
  followHeading?: number;
}

interface CameraMinMaxConfig {
  minZoomLevel?: number;
  maxZoomLevel?: number;
  maxBounds?: {
    ne: Position;
    sw: Position;
  };
}

interface CameraBounds {
  ne: Position;
  sw: Position;
}

interface CameraPadding {
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
}

interface CameraBoundsWithPadding
  extends CameraBounds,
    Partial<CameraPadding> {}

interface CameraStops {
  readonly type: 'CameraStops';
  stops: CameraStop[];
}

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
  /**
   * Sets any camera properties, with default fallbacks if unspecified.
   */
  setCamera: (config: CameraStop | CameraStops) => void;

  /**
   * Set the camera position to enclose the provided bounds, with optional
   * padding and duration.
   *
   * @example
   * camera.fitBounds([lon, lat], [lon, lat]);
   * camera.fitBounds([lon, lat], [lon, lat], 20, 1000);
   * camera.fitBounds([lon, lat], [lon, lat], [verticalPadding, horizontalPadding], 1000);
   * camera.fitBounds([lon, lat], [lon, lat], [top, right, bottom, left], 1000);
   *
   * @param {Position} ne Northeast coordinate of bounding box
   * @param {Position} sw Southwest coordinate of bounding box
   * @param {number} paddingConfig
   * @param {number} animationDuration
   */
  fitBounds: (
    ne: Position,
    sw: Position,
    paddingConfig?: number | number[],
    animationDuration?: number,
  ) => void;

  /**
   * Sets the camera to center around the provided coordinate using a realistic 'travel'
   * animation, with optional duration.
   *
   * @example
   * camera.flyTo([lon, lat]);
   * camera.flyTo([lon, lat], 12000);
   *
   *  @param {Position} centerCoordinate
   *  @param {number} animationDuration
   */
  flyTo: (centerCoordinate: Position, animationDuration?: number) => void;

  /**
   * Sets the camera to center around the provided coordinate, with optional duration.
   *
   * @example
   * camera.moveTo([lon, lat], 200);
   * camera.moveTo([lon, lat]);
   *
   *  @param {Position} centerCoordinate
   *  @param {number} animationDuration
   */
  moveTo: (centerCoordinate: Position, animationDuration?: number) => void;

  /**
   * Zooms the camera to the provided level, with optional duration.
   *
   * @example
   * camera.zoomTo(16);
   * camera.zoomTo(16, 100);
   *
   * @param {number} zoomLevel
   * @param {number} animationDuration
   */
  zoomTo: (zoomLevel: number, animationDuration?: number) => void;
}

/**
 * @param {CameraProps} props
 *
 * @example
 * To use imperative methods, pass in a ref object:
 * ```
 * const camera = useRef<CameraRef>(null);
 *
 * useEffect(() => {
 *   camera.current?.setCamera({
 *     centerCoordinate: [lon, lat],
 *   });
 * }, []);
 *
 * return (
 *   <Camera ref={camera} />
 * );
 * ```
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

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const camera: React.RefObject<RCTMGLCamera> = useRef(null);

    const fitBounds: CameraRef['fitBounds'] = (
      ne,
      sw,
      paddingConfig = 0,
      animationDuration = 0,
    ) => {
      let padding = {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
      };

      if (Array.isArray(paddingConfig)) {
        if (paddingConfig.length === 2) {
          padding = {
            paddingTop: paddingConfig[0],
            paddingBottom: paddingConfig[0],
            paddingLeft: paddingConfig[1],
            paddingRight: paddingConfig[1],
          };
        } else if (paddingConfig.length === 4) {
          padding = {
            paddingTop: paddingConfig[0],
            paddingBottom: paddingConfig[2],
            paddingLeft: paddingConfig[3],
            paddingRight: paddingConfig[1],
          };
        }
      } else {
        padding = {
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
        padding,
        animationDuration,
        animationMode: 'easeTo',
      });
    };

    const flyTo: CameraRef['flyTo'] = (
      centerCoordinate,
      animationDuration = 2000,
    ) => {
      setCamera({
        type: 'CameraStop',
        centerCoordinate,
        animationDuration,
      });
    };

    const moveTo: CameraRef['moveTo'] = (
      centerCoordinate,
      animationDuration = 0,
    ) => {
      setCamera({
        type: 'CameraStop',
        centerCoordinate,
        animationDuration,
        animationMode: 'easeTo',
      });
    };

    const zoomTo: CameraRef['zoomTo'] = (
      zoomLevel,
      animationDuration = 2000,
    ) => {
      setCamera({
        type: 'CameraStop',
        zoomLevel,
        animationDuration,
        animationMode: 'flyTo',
      });
    };

    const nativeAnimationMode = useCallback(
      (_mode?: AnimationMode): NativeAnimationMode | undefined => {
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
            return MapboxGL.CameraModes.Move;
          default:
            return undefined;
        }
      },
      [],
    );

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
        mode: nativeAnimationMode(defaultSettings.animationMode) ?? 'flight',
      };
      return _defaultStop;
    }, [defaultSettings, nativeAnimationMode]);

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
            geoUtils.makePoint(stop.centerCoordinate),
          );
        }

        if (stop.bounds && stop.bounds.ne && stop.bounds.sw) {
          const { ne, sw } = stop.bounds;
          _nativeStop.bounds = JSON.stringify(
            geoUtils.makeLatLngBounds(ne, sw),
          );
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
      [props.followUserLocation, nativeDefaultStop, nativeAnimationMode],
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
      return JSON.stringify(
        geoUtils.makeLatLngBounds(maxBounds.ne, maxBounds.sw),
      );
    }, [maxBounds]);

    const setCamera: CameraRef['setCamera'] = useCallback(
      (config) => {
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
            camera.current.setNativeProps({
              stop: { stops: _nativeStops },
            });
          }
        } else if (config.type === 'CameraStop') {
          const _nativeStop = buildNativeStop(config);
          if (_nativeStop) {
            camera.current.setNativeProps({ stop: _nativeStop });
          }
        }
      },
      [buildNativeStop],
    );

    useImperativeHandle(ref, () => ({
      setCamera,
      fitBounds,
      flyTo,
      moveTo,
      zoomTo,
    }));

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
  }),
);

const RCTMGLCamera =
  requireNativeComponent<NativeCameraProps>(NATIVE_MODULE_NAME);

export default Camera;
