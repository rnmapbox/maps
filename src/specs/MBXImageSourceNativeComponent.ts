import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  id: string;
  existing: boolean;
  url: string;
  coordinates: ReadonlyArray<UnsafeMixed>;
}

export default codegenNativeComponent<NativeProps>(
  'MBXImageSource',
) as HostComponent<NativeProps>;
