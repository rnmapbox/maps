import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { Double } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  stretchX: Array<UnsafeMixed>; // Array<Number> inside UnsafeMixed
  stretchY: Array<UnsafeMixed>; // Array<Number> inside UnsafeMixed
  content: Array<Double>;
  sdf: boolean;
  name: string;
}

export default codegenNativeComponent<NativeProps>(
  'MBXImage',
) as HostComponent<NativeProps>;
