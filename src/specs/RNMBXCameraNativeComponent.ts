import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

type UserTrackingModeChangeEventType = {
  type: string;
  payloadRenamed: {
    followUserLocation: boolean;
    followUserMode: string;
  };
};

export interface NativeProps extends ViewProps {
  maxBounds?: UnsafeMixed;
  animationDuration?: UnsafeMixed;
  animationMode?: UnsafeMixed;
  defaultStop?: UnsafeMixed;
  userTrackingMode?: UnsafeMixed;

  followUserLocation?: UnsafeMixed;
  followUserMode?: UnsafeMixed;
  followZoomLevel?: UnsafeMixed;
  followPitch?: UnsafeMixed;
  followHeading?: UnsafeMixed;
  followPadding?: UnsafeMixed;

  zoomLevel?: UnsafeMixed;
  maxZoomLevel?: UnsafeMixed;
  minZoomLevel?: UnsafeMixed;
  onUserTrackingModeChange?: DirectEventHandler<UserTrackingModeChangeEventType>;
  stop?: UnsafeMixed;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXCamera',
) as HostComponent<NativeProps>;
