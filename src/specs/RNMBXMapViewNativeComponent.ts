import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

type LocalizeLabels =
  | {
      locale: string;
      layerIds?: string[];
    }
  | true;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PayloadType<_T> = string;

type OnCameraChangedEventType = {
  type: string;
  payload: string /* | MapState */;
};
type OnPressEventType = { type: string; payload: string };
type OnMapChangeEventType = { type: string; payload: string };

export interface NativeProps extends ViewProps {
  onCameraChanged?: DirectEventHandler<OnCameraChangedEventType>;

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

  onPress?: DirectEventHandler<OnPressEventType>;
  onLongPress?: DirectEventHandler<OnPressEventType>;
  onMapChange?: DirectEventHandler<OnMapChangeEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXMapView',
) as HostComponent<NativeProps>;
