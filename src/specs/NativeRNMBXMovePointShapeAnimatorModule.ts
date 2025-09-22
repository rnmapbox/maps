import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

//import type { UnsafeMixed } from './codegenUtils';

type AnimatorTag = CodegenTypes.Int32;

export interface Spec extends TurboModule {
  generate(
    tag: AnimatorTag,
    coordinate: ReadonlyArray<CodegenTypes.Double>,
  ): Promise<void>;
  moveTo(
    tag: AnimatorTag,
    coordinate: ReadonlyArray<CodegenTypes.Double>,
    duration: CodegenTypes.Double,
  ): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'RNMBXMovePointShapeAnimatorModule',
);
