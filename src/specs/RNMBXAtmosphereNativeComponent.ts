import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  reactStyle: UnsafeMixed<any>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXAtmosphere',
) as HostComponent<NativeProps>;
