import type { HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

import type { UnsafeMixed } from './codegenUtils';

export interface NativeProps extends ViewProps {
  sourceID?: UnsafeMixed<string>;
  reactStyle: UnsafeMixed<any>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXTerrain',
) as HostComponent<NativeProps>;
