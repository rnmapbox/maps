import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  takeSnap: (
    viewRef: CodegenTypes.Int32 | null,
    writeToDisk: boolean,
  ) => Promise<Object>;
  queryTerrainElevation: (
    viewRef: CodegenTypes.Int32 | null,
    coordinates: ReadonlyArray<number>,
  ) => Promise<Object>;
  setSourceVisibility: (
    viewRef: CodegenTypes.Int32 | null,
    visible: boolean,
    sourceId: string,
    sourceLayerId: string,
  ) => Promise<Object>;
  getCenter: (viewRef: CodegenTypes.Int32 | null) => Promise<Object>;
  getCoordinateFromView: (
    viewRef: CodegenTypes.Int32 | null,
    atPoint: ReadonlyArray<number>,
  ) => Promise<Object>;
  getPointInView: (
    viewRef: CodegenTypes.Int32 | null,
    atCoordinate: ReadonlyArray<number>,
  ) => Promise<Object>;
  getZoom: (viewRef: CodegenTypes.Int32 | null) => Promise<Object>;
  getVisibleBounds: (viewRef: CodegenTypes.Int32 | null) => Promise<Object>;
  queryRenderedFeaturesAtPoint: (
    viewRef: CodegenTypes.Int32 | null,
    atPoint: ReadonlyArray<number>,
    withFilter: ReadonlyArray<Object>,
    withLayerIDs: ReadonlyArray<string>,
  ) => Promise<Object>;
  queryRenderedFeaturesInRect: (
    viewRef: CodegenTypes.Int32 | null,
    withBBox: ReadonlyArray<number>,
    withFilter: ReadonlyArray<Object>,
    withLayerIDs: ReadonlyArray<string>,
  ) => Promise<Object>;
  setHandledMapChangedEvents: (
    viewRef: CodegenTypes.Int32 | null,
    events: ReadonlyArray<string>,
  ) => Promise<Object>;
  clearData: (viewRef: CodegenTypes.Int32 | null) => Promise<Object>;
  querySourceFeatures: (
    viewRef: CodegenTypes.Int32 | null,
    sourceId: string,
    withFilter: ReadonlyArray<Object>,
    withSourceLayerIDs: ReadonlyArray<string>,
  ) => Promise<Object>;
  setFeatureState: (
    viewRef: CodegenTypes.Int32 | null,
    featureId: string,
    state: Object,
    sourceId: string,
    sourceLayerId: string | null,
  ) => Promise<Object>;
  getFeatureState: (
    viewRef: CodegenTypes.Int32 | null,
    featureId: string,
    sourceId: string,
    sourceLayerId: string | null,
  ) => Promise<Object>;
  removeFeatureState: (
    viewRef: CodegenTypes.Int32 | null,
    featureId: string,
    stateKey: string | null,
    sourceId: string,
    sourceLayerId: string | null,
  ) => Promise<Object>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNMBXMapViewModule');
