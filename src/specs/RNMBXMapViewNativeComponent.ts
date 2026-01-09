import type { HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import type { Point, UnsafeMixed } from './codegenUtils';
import type { CodegenTypes } from 'react-native';

// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;

type GestureSettings = {
  doubleTapToZoomInEnabled?: boolean;
  doubleTouchToZoomOutEnabled?: boolean;
  pinchScrollEnabled?: boolean;
  pinchToZoomDecelerationEnabled?: boolean;
};

type LocalizeLabels =
  | {
      locale: string;
      layerIds?: string[];
    }
  | true;

type OnCameraChangedEventType = {
  type: string;
  payload: string;
};
type OnPressEventType = { type: string; payload: string };
type OnMapChangeEventType = { type: string; payload: string };

export interface NativeProps extends ViewProps {
  attributionEnabled?: OptionalProp<boolean>;
  attributionPosition?: UnsafeMixed<any>;

  logoEnabled?: OptionalProp<boolean>;
  logoPosition?: UnsafeMixed<any>;

  compassEnabled?: OptionalProp<boolean>;
  compassFadeWhenNorth?: OptionalProp<boolean>;
  compassPosition?: UnsafeMixed<any>;
  compassViewPosition?: OptionalProp<CodegenTypes.Int32>;
  compassViewMargins?: OptionalProp<Point>;

  scaleBarEnabled?: OptionalProp<boolean>;
  scaleBarPosition?: UnsafeMixed<any>;

  zoomEnabled?: OptionalProp<boolean>;
  scrollEnabled?: OptionalProp<boolean>;
  rotateEnabled?: OptionalProp<boolean>;
  pitchEnabled?: OptionalProp<boolean>;
  maxPitch?: OptionalProp<CodegenTypes.Double>;

  deselectAnnotationOnTap?: OptionalProp<boolean>;

  requestDisallowInterceptTouchEvent?: OptionalProp<boolean>;

  projection?: OptionalProp<'mercator' | 'globe'>;
  localizeLabels?: UnsafeMixed<LocalizeLabels>;

  styleURL?: OptionalProp<string>;

  gestureSettings?: UnsafeMixed<GestureSettings>;

  // Android only
  surfaceView?: OptionalProp<boolean>;
  scaleBarViewMargins?: UnsafeMixed<any>;
  attributionViewMargins?: UnsafeMixed<any>;
  attributionViewPosition?: UnsafeMixed<any>;

  // iOS only
  compassImage?: OptionalProp<string>;

  onPress?: CodegenTypes.BubblingEventHandler<OnPressEventType>;
  onLongPress?: CodegenTypes.DirectEventHandler<OnPressEventType>;
  onMapChange?: CodegenTypes.DirectEventHandler<OnMapChangeEventType>;
  onCameraChanged?: CodegenTypes.DirectEventHandler<OnCameraChangedEventType>;

  mapViewImpl?: OptionalProp<string>;
  preferredFramesPerSecond?: OptionalProp<CodegenTypes.Int32>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXMapView',
) as HostComponent<NativeProps>;

// The actually types for callbacks are sometwhat different due to codegen limitations:

type MapState = {
  properties: {
    center: GeoJSON.Position;
    bounds: {
      ne: GeoJSON.Position;
      sw: GeoJSON.Position;
    };
    zoom: number;
    heading: number;
    pitch: number;
  };
  gestures: {
    isGestureActive: boolean;
  };
  timestamp?: number;
};
type RegionPayload = {
  zoomLevel: number;
  heading: number;
  animated: boolean;
  isUserInteraction: boolean;
  visibleBounds: GeoJSON.Position[];
  pitch: number;
};

type OnPressEventTypeActual = {
  type: string;
  payload: GeoJSON.Feature | string;
};
type OnCameraChangedEventTypeActual = {
  type: string;
  payload: MapState | string;
};
type OnMapChangeEventTypeActual = {
  type: string;
  payload:
    | GeoJSON.Feature<
        GeoJSON.Point,
        RegionPayload & { isAnimatingFromUserInteraction: boolean }
      >
    | string;
};

export type NativeMapViewActual = HostComponent<
  Omit<NativeProps, 'onCameraChanged' | 'onLongPress' | 'onMapChange'> & {
    onCameraChanged?: CodegenTypes.DirectEventHandler<OnCameraChangedEventTypeActual>;
    onLongPress?: CodegenTypes.DirectEventHandler<OnPressEventTypeActual>;
    onPress?: CodegenTypes.DirectEventHandler<OnPressEventTypeActual>;
    onMapChange?: CodegenTypes.DirectEventHandler<OnMapChangeEventTypeActual>;
  }
>;
