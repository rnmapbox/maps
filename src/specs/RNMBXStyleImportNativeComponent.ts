import type { HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import type { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  id: string;
  existing: boolean;
  config: UnsafeMixed<{ [key: string]: string }>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXStyleImport',
) as HostComponent<NativeProps>;
