import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
// @ts-ignore - CI environment type resolution issue for CodegenTypes
import type { Double } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  stretchX: UnsafeMixed<Array<any>>; // Array<Number> inside UnsafeMixed
  stretchY: UnsafeMixed<Array<any>>; // Array<Number> inside UnsafeMixed
  content: UnsafeMixed<Array<Double>>;
  sdf: UnsafeMixed<boolean>;
  name: UnsafeMixed<string>;
  scale?: UnsafeMixed<number>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXImage',
) as HostComponent<NativeProps>;
