import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
// @ts-ignore - CI environment type resolution issue for CodegenTypes
import { Double } from 'react-native/Libraries/Types/CodegenTypes';

import { type UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  id: UnsafeMixed<string>;
  existing: UnsafeMixed<boolean>;
  url: UnsafeMixed<string>;
  tileUrlTemplates: UnsafeMixed<Array<string>>;
  minZoomLevel: UnsafeMixed<Double>;
  maxZoomLevel: UnsafeMixed<Double>;
  tileSize: UnsafeMixed<Double>;
  tms: UnsafeMixed<boolean>;
  attribution: UnsafeMixed<string>;
  sourceBounds: UnsafeMixed<Array<number>>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXRasterSource',
) as HostComponent<NativeProps>;
