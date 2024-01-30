import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { Int32, Double } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';

//import type { UnsafeMixed } from './codegenUtils';

type AnimatorTag = Int32;

export interface Spec extends TurboModule {
  create(tag: AnimatorTag, coordinate: ReadonlyArray<Double>): Promise<void>;
  moveTo(
    tag: AnimatorTag,
    coordinate: ReadonlyArray<Double>,
    duration: Double,
  ): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'RNMBXMovePointShapeAnimatorModule',
);
