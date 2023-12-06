import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';

import { UnsafeMixed } from './codegenUtils';

type Point = {
  x: Int32;
  y: Int32;
};

export interface NativeProps extends ViewProps {
  coordinate?: UnsafeMixed<string>;
  anchor: UnsafeMixed<Point>;
  allowOverlap: UnsafeMixed<boolean>;
  allowOverlapWithPuck: UnsafeMixed<boolean>;
  isSelected: UnsafeMixed<boolean>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXMarkerView',
) as HostComponent<NativeProps>;
