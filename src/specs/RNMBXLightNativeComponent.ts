import type { HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import type { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  reactStyle: UnsafeMixed<any>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXLight',
) as HostComponent<NativeProps>;
