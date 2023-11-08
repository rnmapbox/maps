import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  androidRenderMode?: UnsafeMixed<string>;
  iosShowsUserHeadingIndicator?: UnsafeMixed<boolean>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXNativeUserLocation',
) as HostComponent<NativeProps>;
