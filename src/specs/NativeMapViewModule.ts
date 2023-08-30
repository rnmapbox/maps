/* eslint-disable @typescript-eslint/ban-types */
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  takeSnap: (viewRef: Int32 | null, writeToDisk: boolean) => Promise<Object>;
  queryTerrainElevation: (
    viewRef: Int32,
    coordinates: ReadonlyArray<number>,
  ) => Promise<Object>;
  setSourceVisibility: (
    viewRef: Int32,
    visible: boolean,
    sourceId: string,
    sourceLayerId: string,
  ) => Promise<Object>;
  getCenter: (viewRef: Int32) => Promise<Object>;
  getCoordinateFromView: (
    viewRef: Int32,
    atPoint: ReadonlyArray<number>,
  ) => Promise<Object>;
  getPointInView: (
    viewRef: Int32,
    atCoordinate: ReadonlyArray<number>,
  ) => Promise<Object>;
  getZoom: (viewRef: Int32) => Promise<Object>;
  getVisibleBounds: (viewRef: Int32) => Promise<Object>;
  queryRenderedFeaturesAtPoint: (
    viewRef: Int32,
    atPoint: ReadonlyArray<number>,
    withFilter: ReadonlyArray<Object>,
    withLayerIDs: ReadonlyArray<string>,
  ) => Promise<Object>;
  queryRenderedFeaturesInRect: (
    viewRef: Int32,
    withBBox: ReadonlyArray<number>,
    withFilter: ReadonlyArray<Object>,
    withLayerIDs: ReadonlyArray<string>,
  ) => Promise<Object>;
  setHandledMapChangedEvents: (
    viewRef: Int32,
    events: ReadonlyArray<string>,
  ) => Promise<Object>;
  clearData: (viewRef: Int32) => Promise<Object>;
}

export default TurboModuleRegistry.get<Spec>('MBXMapViewModule');
