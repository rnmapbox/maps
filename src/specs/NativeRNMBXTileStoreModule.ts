import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unused-vars
type ObjectOr<T> = Object;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type StringOr<_T> = string;

type Domain = 'Maps' | 'Navigation' | 'Search' | 'ADAS';

type Tag = Int32;

type Value = { value: string | number };

export interface Spec extends TurboModule {
  shared(path?: string): Promise<Tag>;
  setOption(
    tag: Tag,
    key: string,
    domain: StringOr<Domain>,
    value: ObjectOr<Value>,
  ): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNMBXTileStoreModule');
