import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
  BubblingEventHandler,
  DirectEventHandler,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

import type { Point, UnsafeMixed } from './codegenUtils';

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
  compassViewPosition?: OptionalProp<Int32>;
  compassViewMargins?: OptionalProp<Point>;

  scaleBarEnabled?: OptionalProp<boolean>;
  scaleBarPosition?: UnsafeMixed<any>;

  zoomEnabled?: OptionalProp<boolean>;
  scrollEnabled?: OptionalProp<boolean>;
  rotateEnabled?: OptionalProp<boolean>;
  pitchEnabled?: OptionalProp<boolean>;

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

  onPress?: BubblingEventHandler<OnPressEventType>;
  onLongPress?: DirectEventHandler<OnPressEventType>;
  onMapChange?: DirectEventHandler<OnMapChangeEventType>;
  onCameraChanged?: DirectEventHandler<OnCameraChangedEventType>;

  mapViewImpl?: OptionalProp<string>;
}

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
    onCameraChanged?: DirectEventHandler<OnCameraChangedEventTypeActual>;
    onLongPress?: DirectEventHandler<OnPressEventTypeActual>;
    onPress?: DirectEventHandler<OnPressEventTypeActual>;
    onMapChange?: DirectEventHandler<OnMapChangeEventTypeActual>;
  }
>;
