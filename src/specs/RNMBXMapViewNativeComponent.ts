import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

type OnCameraChangedEventType = { type: string; payload: string };
type OnPressEventType = { type: string; payload: string };
type OnMapChangeEventType = { type: string; payload: string };

export interface NativeProps extends ViewProps {
  onCameraChanged?: DirectEventHandler<OnCameraChangedEventType>;

  attributionEnabled?: UnsafeMixed;
  attributionPosition?: UnsafeMixed;

  logoEnabled?: UnsafeMixed;
  logoPosition?: UnsafeMixed;

  compassEnabled?: UnsafeMixed;
  compassFadeWhenNorth?: UnsafeMixed;
  compassPosition?: UnsafeMixed;
  compassViewPosition?: UnsafeMixed;
  compassViewMargins?: UnsafeMixed;

  scaleBarEnabled?: UnsafeMixed;
  scaleBarPosition?: UnsafeMixed;

  zoomEnabled?: UnsafeMixed;
  scrollEnabled?: UnsafeMixed;
  rotateEnabled?: UnsafeMixed;
  pitchEnabled?: UnsafeMixed;

  requestDisallowInterceptTouchEvent?: UnsafeMixed;

  projection?: UnsafeMixed;
  localizeLabels?: UnsafeMixed;

  styleURL?: UnsafeMixed;

  // Android only
  scaleBarViewMargins?: UnsafeMixed;
  attributionViewMargins?: UnsafeMixed;
  attributionViewPosition?: UnsafeMixed;

  // iOS only
  compassImage?: UnsafeMixed;

  onPress?: DirectEventHandler<OnPressEventType>;
  onLongPress?: DirectEventHandler<OnPressEventType>;
  onMapChange?: DirectEventHandler<OnMapChangeEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXMapView',
) as HostComponent<NativeProps>;
