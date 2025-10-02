import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
// @ts-ignore - CI environment type resolution issue for CodegenTypes
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  refresh: (viewRef: Int32 | null) => Promise<Object>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'RNMBXPointAnnotationModule',
);
