import type { HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  id: UnsafeMixed<string>;
  existing: UnsafeMixed<boolean>;
  url: UnsafeMixed<string>;
  coordinates: UnsafeMixed;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXImageSource',
) as HostComponent<NativeProps>;
