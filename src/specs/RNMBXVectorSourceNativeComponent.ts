import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
  DirectEventHandler,
  Double,
  // @ts-ignore - CI environment type resolution issue for CodegenTypes
} from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

type OnMapboxVectorSourcePressEventType = { type: string; payload: string };

export interface NativeProps extends ViewProps {
  id: UnsafeMixed<string>;
  existing: UnsafeMixed<boolean>;
  url: UnsafeMixed<string>;
  tileUrlTemplates: UnsafeMixed<Array<string>>;
  attribution: UnsafeMixed<string>;
  maxZoomLevel: UnsafeMixed<Double>;
  minZoomLevel: UnsafeMixed<Double>;
  tms: UnsafeMixed<boolean>;
  hasPressListener: UnsafeMixed<boolean>;
  hitbox: UnsafeMixed<any>;
  onMapboxVectorSourcePress: DirectEventHandler<OnMapboxVectorSourcePressEventType>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXVectorSource',
) as HostComponent<NativeProps>;
