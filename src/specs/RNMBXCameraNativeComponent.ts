import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
  type DirectEventHandler,
  type Double,
  type Int32,
  // @ts-ignore - CI environment type resolution issue for CodegenTypes
} from 'react-native/Libraries/Types/CodegenTypes';

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
  animationDuration?: OptionalProp<Double>;
  animationMode?: OptionalProp<string>;
  defaultStop?: UnsafeMixed<NativeCameraStop>;
  userTrackingMode?: OptionalProp<Int32>;

  followUserLocation?: OptionalProp<boolean>;
  followUserMode?: OptionalProp<string>;
  followZoomLevel?: OptionalProp<Double>;
  followPitch?: OptionalProp<Double>;
  followHeading?: OptionalProp<Double>;
  followPadding?: UnsafeMixed<any>;

  zoomLevel?: OptionalProp<Double>;
  maxZoomLevel?: OptionalProp<Double>;
  minZoomLevel?: OptionalProp<Double>;
  stop?: UnsafeMixed<NativeCameraStop>;

  onUserTrackingModeChange?: DirectEventHandler<UserTrackingModeChangeEventType>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXCamera',
) as HostComponent<NativeProps>;
