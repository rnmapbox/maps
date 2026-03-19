import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  refresh: (viewRef: CodegenTypes.Int32 | null) => Promise<Object>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNMBXImageModule');
