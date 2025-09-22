import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import { Position } from '@turf/helpers';

//import type { UnsafeMixed } from './codegenUtils';

type AnimatorTag = CodegenTypes.Int32;

export interface Spec extends TurboModule {
  generate(
    tag: AnimatorTag,
    coordinates: Position[],
    startOffset: CodegenTypes.Double,
    endOffset: CodegenTypes.Double,
  ): Promise<void>;
  setLineString(
    tag: AnimatorTag,
    coordinates: Position[],
    startOffset: number,
    endOffset: number,
  ): Promise<void>;
  setStartOffset(
    tag: AnimatorTag,
    offset: CodegenTypes.Double,
    duration: CodegenTypes.Double,
  ): Promise<void>;
  setEndOffset(
    tag: AnimatorTag,
    offset: CodegenTypes.Double,
    duration: CodegenTypes.Double,
  ): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'RNMBXChangeLineOffsetsShapeAnimatorModule',
);
