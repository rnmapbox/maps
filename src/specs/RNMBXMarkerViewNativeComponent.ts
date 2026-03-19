import type { HostComponent, ViewProps } from 'react-native';
// @ts-ignore - CI environment type resolution issue for CodegenTypes
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import { type Position } from '../types/Position';

import { type UnsafeMixed } from './codegenUtils';

type Point = {
  x: Int32;
  y: Int32;
};

export interface NativeProps extends ViewProps {
  coordinate?: UnsafeMixed<Position>;
  anchor: UnsafeMixed<Point>;
  allowOverlap: UnsafeMixed<boolean>;
  allowOverlapWithPuck: UnsafeMixed<boolean>;
  isSelected: UnsafeMixed<boolean>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXMarkerView',
) as HostComponent<NativeProps>;
