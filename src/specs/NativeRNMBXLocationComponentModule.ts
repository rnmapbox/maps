/***
rnmbxcodegen: true
component: RNMBXLocation
***/
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';

type ViewRef = Int32 | null;

export interface Spec extends TurboModule {
  someMethod(viewRef: ViewRef): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'RNMBXLocationComponentModule',
);
