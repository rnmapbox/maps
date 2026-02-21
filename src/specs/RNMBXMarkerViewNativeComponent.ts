import type { HostComponent, ViewProps, CodegenTypes } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import { Position } from '../types/Position';

import { UnsafeMixed } from './codegenUtils';

type Point = {
  x: CodegenTypes.Int32;
  y: CodegenTypes.Int32;
};

export interface NativeProps extends ViewProps {
  coordinate?: UnsafeMixed<Position>;
  anchor: UnsafeMixed<Point>;
  allowOverlap: UnsafeMixed<boolean>;
  allowOverlapWithPuck: UnsafeMixed<boolean>;
  isSelected: UnsafeMixed<boolean>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXMarkerView',
) as HostComponent<NativeProps>;
