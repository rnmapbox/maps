import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type { UnsafeMixed } from './codegenUtils';

// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;

type Slot = 'bottom' | 'middle' | 'top';

export interface NativeProps extends ViewProps {
  slot?: OptionalProp<Slot>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXPointAnnotationManager',
) as HostComponent<NativeProps>;
