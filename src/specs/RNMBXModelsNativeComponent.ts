import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  models: UnsafeMixed<{ [key: string]: string }>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXModels',
) as HostComponent<NativeProps>;
