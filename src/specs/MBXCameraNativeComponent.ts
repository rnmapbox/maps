import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
  DirectEventHandler,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

type UserTrackingModeChangeEventType = {
  followUserLocation: boolean;
  followUserMode: string;
};

type NativeCameraStop = {
  centerCoordinate?: string;
  bounds?: string;
  heading?: Double;
  pitch?: Double;
  zoom?: Double;
  paddingLeft?: Double;
  paddingRight?: Double;
  paddingTop?: Double;
  paddingBottom?: Double;
  duration?: Double;
  mode?: string;
};

export interface NativeProps extends ViewProps {
  maxBounds?: string | null;
  animationDuration?: Double;
  animationMode?: string;
  defaultStop?: NativeCameraStop | null;

  followUserLocation?: boolean;
  followUserMode?: string;
  followZoomLevel?: Double;
  followPitch?: Double;
  followHeading?: Double;
  followPadding?: UnsafeMixed;

  maxZoomLevel?: Double;
  minZoomLevel?: Double;
  onUserTrackingModeChange?: DirectEventHandler<UserTrackingModeChangeEventType>;
  stop?: NativeCameraStop | null;
}

export default codegenNativeComponent<NativeProps>(
  'MBXCamera',
) as HostComponent<NativeProps>;
