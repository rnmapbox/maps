/* eslint-disable @typescript-eslint/ban-types */
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  refresh: (viewRef: Int32 | null) => Promise<Object>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'RNMBXPointAnnotationModule',
);
