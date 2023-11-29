import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import { UnsafeMixed } from './codegenUtils';

type Asset = {
  __packager_asset?: boolean;
  uri?: string;
  url?: string;
};

export interface NativeProps extends ViewProps {
  models: UnsafeMixed<{ [key: string]: Asset }>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXModels',
) as HostComponent<NativeProps>;
