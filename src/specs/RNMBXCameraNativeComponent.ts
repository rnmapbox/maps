import type { HostComponent, ViewProps, CodegenTypes } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import type { NativeCameraStop, UnsafeMixed } from './codegenUtils';

// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;

type UserTrackingModeChangeEventType = {
  type: string;
  payloadRenamed: {
    followUserLocation: boolean;
    followUserMode: string;
  };
};

export interface NativeProps extends ViewProps {
  maxBounds?: UnsafeMixed<string | null>;
  animationDuration?: OptionalProp<CodegenTypes.Double>;
  animationMode?: OptionalProp<string>;
  defaultStop?: UnsafeMixed<NativeCameraStop>;
  userTrackingMode?: OptionalProp<CodegenTypes.Int32>;

  followUserLocation?: OptionalProp<boolean>;
  followUserMode?: OptionalProp<string>;
  followZoomLevel?: OptionalProp<CodegenTypes.Double>;
  followPitch?: OptionalProp<CodegenTypes.Double>;
  followHeading?: OptionalProp<CodegenTypes.Double>;
  followPadding?: UnsafeMixed<any>;

  zoomLevel?: OptionalProp<CodegenTypes.Double>;
  maxZoomLevel?: OptionalProp<CodegenTypes.Double>;
  minZoomLevel?: OptionalProp<CodegenTypes.Double>;
  stop?: UnsafeMixed<NativeCameraStop>;

  onUserTrackingModeChange?: CodegenTypes.DirectEventHandler<UserTrackingModeChangeEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXCamera',
) as HostComponent<NativeProps>;
