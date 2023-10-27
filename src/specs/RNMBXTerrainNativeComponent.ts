import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  sourceID?: UnsafeMixed<string>;
  reactStyle: UnsafeMixed<any>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXTerrain',
) as HostComponent<NativeProps>;
