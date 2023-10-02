import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
  DirectEventHandler,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

import type { LocalizeLabels, Point, UnsafeMixed } from './codegenUtils';

type OnCameraChangedEventType = { type: string; payload: string };
type OnPressEventType = { type: string; payload: string };
type OnMapChangeEventType = { type: string; payload: string };

export interface NativeProps extends ViewProps {
  onCameraChanged?: DirectEventHandler<OnCameraChangedEventType>;

  attributionEnabled?: UnsafeMixed<boolean>;
  attributionPosition?: UnsafeMixed<any>;

  logoEnabled?: UnsafeMixed<boolean>;
  logoPosition?: UnsafeMixed<any>;

  compassEnabled?: UnsafeMixed<boolean>;
  compassFadeWhenNorth?: UnsafeMixed<boolean>;
  compassPosition?: UnsafeMixed<any>;
  compassViewPosition?: UnsafeMixed<Int32>;
  compassViewMargins?: UnsafeMixed<Point>;

  scaleBarEnabled?: UnsafeMixed<boolean>;
  scaleBarPosition?: UnsafeMixed<any>;

  zoomEnabled?: UnsafeMixed<boolean>;
  scrollEnabled?: UnsafeMixed<boolean>;
  rotateEnabled?: UnsafeMixed<boolean>;
  pitchEnabled?: UnsafeMixed<boolean>;

  requestDisallowInterceptTouchEvent?: UnsafeMixed<boolean>;

  projection?: UnsafeMixed<string>;
  localizeLabels?: UnsafeMixed<LocalizeLabels>;

  styleURL?: UnsafeMixed<string>;

  // Android only
  scaleBarViewMargins?: UnsafeMixed<any>;
  attributionViewMargins?: UnsafeMixed<any>;
  attributionViewPosition?: UnsafeMixed<any>;

  onPress?: DirectEventHandler<OnPressEventType>;
  onLongPress?: DirectEventHandler<OnPressEventType>;
  onMapChange?: DirectEventHandler<OnMapChangeEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXAndroidTextureMapView',
  {
    excludedPlatforms: ['iOS'],
  },
) as HostComponent<NativeProps>;
