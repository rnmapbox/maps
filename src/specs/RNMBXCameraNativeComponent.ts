import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
  DirectEventHandler,
  Double,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

import type { NativeCameraStop, UnsafeMixed } from './codegenUtils';

type UserTrackingModeChangeEventType = {
  type: string;
  payloadRenamed: {
    followUserLocation: boolean;
    followUserMode: string;
  };
};

export interface NativeProps extends ViewProps {
  maxBounds?: UnsafeMixed<string>;
  animationDuration?: UnsafeMixed<Double>;
  animationMode?: UnsafeMixed<string>;
  defaultStop?: UnsafeMixed<NativeCameraStop>;
  userTrackingMode?: UnsafeMixed<Int32>;

  followUserLocation?: UnsafeMixed<boolean>;
  followUserMode?: UnsafeMixed<string>;
  followZoomLevel?: UnsafeMixed<Double>;
  followPitch?: UnsafeMixed<Double>;
  followHeading?: UnsafeMixed<Double>;
  followPadding?: UnsafeMixed<any>;

  zoomLevel?: UnsafeMixed<Double>;
  maxZoomLevel?: UnsafeMixed<Double>;
  minZoomLevel?: UnsafeMixed<Double>;
  stop?: UnsafeMixed<NativeCameraStop>;

  onUserTrackingModeChange?: DirectEventHandler<UserTrackingModeChangeEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXCamera',
) as HostComponent<NativeProps>;
