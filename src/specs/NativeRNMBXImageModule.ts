/* eslint-disable @typescript-eslint/ban-types */
import type { TurboModule } from 'react-native';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  refresh: (viewRef: Int32 | null) => Promise<Object>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNMBXImageModule');
