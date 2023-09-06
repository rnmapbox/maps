import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';

type Point = {
  x: Int32;
  y: Int32;
};

export interface NativeProps extends ViewProps {
  coordinate?: string;
  anchor: Point;
  allowOverlap: boolean;
  isSelected: boolean;
}

export default codegenNativeComponent<NativeProps>(
  'MBXMarkerView',
) as HostComponent<NativeProps>;
