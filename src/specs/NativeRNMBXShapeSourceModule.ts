/* eslint-disable @typescript-eslint/ban-types */
import type { TurboModule } from 'react-native';
import type { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
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
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNMBXShapeSourceModule');
