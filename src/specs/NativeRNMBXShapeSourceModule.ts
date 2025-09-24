import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getClusterExpansionZoom: (
    viewRef: CodegenTypes.Int32 | null,
    featureJSON: string,
  ) => Promise<Object>;
  getClusterLeaves: (
    viewRef: CodegenTypes.Int32 | null,
    featureJSON: string,
    number: CodegenTypes.Int32,
    offset: CodegenTypes.Int32,
  ) => Promise<Object>;
  getClusterChildren: (
    viewRef: CodegenTypes.Int32 | null,
    featureJSON: string,
  ) => Promise<Object>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNMBXShapeSourceModule');
