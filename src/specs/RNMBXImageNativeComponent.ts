import type { HostComponent, ViewProps, CodegenTypes } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import type { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  stretchX: UnsafeMixed<Array<any>>; // Array<Number> inside UnsafeMixed
  stretchY: UnsafeMixed<Array<any>>; // Array<Number> inside UnsafeMixed
  content: UnsafeMixed<Array<CodegenTypes.Double>>;
  sdf: UnsafeMixed<boolean>;
  name: UnsafeMixed<string>;
  scale?: UnsafeMixed<number>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXImage',
) as HostComponent<NativeProps>;
