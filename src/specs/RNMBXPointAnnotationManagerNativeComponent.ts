import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import type { UnsafeMixed } from './codegenUtils';

// see https://github.com/rnmapbox/maps/wiki/FabricOptionalProp
type OptionalProp<T> = UnsafeMixed<T>;

type Slot = 'bottom' | 'middle' | 'top';

export interface NativeProps extends ViewProps {
  /** Stable Mapbox layer id for this manager. When omitted the SDK generates one. */
  id?: OptionalProp<string>;
  /** Marks this as the manager used by PointAnnotations not wrapped in a manager. */
  isDefault?: OptionalProp<boolean>;
  slot?: OptionalProp<Slot>;
  iconAllowOverlap?: OptionalProp<boolean>;
  iconIgnorePlacement?: OptionalProp<boolean>;
  iconOptional?: OptionalProp<boolean>;
  textAllowOverlap?: OptionalProp<boolean>;
  textIgnorePlacement?: OptionalProp<boolean>;
  textOptional?: OptionalProp<boolean>;
}

// @ts-ignore-error - Codegen requires single cast but TypeScript prefers double cast
export default codegenNativeComponent<NativeProps>(
  'RNMBXPointAnnotationManager',
) as HostComponent<NativeProps>;
