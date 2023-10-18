import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
  DirectEventHandler,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

import type { LocalizeLabels, Point, UnsafeMixed } from './codegenUtils';

// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;

type OnCameraChangedEventType = { type: string; payload: string };
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

  projection?: OptionalProp<string>;
  localizeLabels?: UnsafeMixed<LocalizeLabels>;

  styleURL?: OptionalProp<string>;

  // Android only
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
