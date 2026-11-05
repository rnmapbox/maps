import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
// @ts-ignore - CI environment type resolution issue for CodegenTypes
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getClusterExpansionZoom: (
    viewRef: Int32 | null,
    featureJSON: string,
  ) => Promise<Object>;
  getClusterLeaves: (
    viewRef: Int32 | null,
    featureJSON: string,
    number: Int32,
    offset: Int32,
  ) => Promise<Object>;
  getClusterChildren: (
    viewRef: Int32 | null,
    featureJSON: string,
  ) => Promise<Object>;
  addFeatures: (
    viewRef: Int32 | null,
    featuresJSON: string,
    featureIds: ReadonlyArray<string>,
    shapeRevision: Int32,
  ) => Promise<void>;
  updateFeatures: (
    viewRef: Int32 | null,
    featuresJSON: string,
    featureIds: ReadonlyArray<string>,
    shapeRevision: Int32,
  ) => Promise<void>;
  removeFeatures: (
    viewRef: Int32 | null,
    featureIds: ReadonlyArray<string>,
    shapeRevision: Int32,
  ) => Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNMBXShapeSourceModule');
