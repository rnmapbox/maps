import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  id: string;
  existing: boolean;
  config: UnsafeMixed<{ [key: string]: string }>;
}

// @ts-expect-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXStyleImport',
) as HostComponent<NativeProps>;
