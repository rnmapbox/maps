import type { HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';
import type { Double } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stretchX: UnsafeMixed<Array<any>>; // Array<Number> inside UnsafeMixed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stretchY: UnsafeMixed<Array<any>>; // Array<Number> inside UnsafeMixed
  content: UnsafeMixed<Array<Double>>;
  sdf: UnsafeMixed<boolean>;
  name: UnsafeMixed<string>;
  scale?: UnsafeMixed<number>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXImage',
) as HostComponent<NativeProps>;
