import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import { type UnsafeMixed } from './codegenUtils';

type Asset = {
  __packager_asset?: boolean;
  uri?: string;
  url?: string;
};

export interface NativeProps extends ViewProps {
  models: UnsafeMixed<{ [key: string]: Asset }>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXModels',
) as HostComponent<NativeProps>;
