import type { HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import type { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  reactStyle: UnsafeMixed;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXAtmosphere',
) as HostComponent<NativeProps>;
