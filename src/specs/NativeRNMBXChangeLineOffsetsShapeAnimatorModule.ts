import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { Int32, Double } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';
import { Position } from '@turf/helpers';

//import type { UnsafeMixed } from './codegenUtils';

type AnimatorTag = Int32;

export interface Spec extends TurboModule {
  create(
    tag: AnimatorTag,
    coordinates: Position[],
    startOffset: Double,
    endOffset: Double,
  ): Promise<void>;
  setLineString(
    tag: AnimatorTag,
    coordinates: Position[],
    startOffset: number,
    endOffset: number,
  ): Promise<void>;
  setStartOffset(
    tag: AnimatorTag,
    offset: Double,
    duration: Double,
  ): Promise<void>;
  setEndOffset(
    tag: AnimatorTag,
    offset: Double,
    duration: Double,
  ): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'RNMBXChangeLineOffsetsShapeAnimatorModule',
);
