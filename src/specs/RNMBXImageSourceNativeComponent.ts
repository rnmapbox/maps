import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  id: UnsafeMixed<string>;
  existing: UnsafeMixed<boolean>;
  url: UnsafeMixed<string>;
  coordinates: UnsafeMixed<any>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXImageSource',
) as HostComponent<NativeProps>;
