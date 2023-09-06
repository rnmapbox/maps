export * from './MGLModule';
export {
  Camera,
  UserTrackingMode,
  type CameraPadding,
  type CameraAnimationMode,
  type CameraBounds,
} from './components/Camera';
export { Atmosphere } from './components/Atmosphere';
export { default as MapView, type MapState } from './components/MapView';
export { default as Light } from './components/Light';
export { default as PointAnnotation } from './components/PointAnnotation';
export { default as Annotation } from './components/Annotation';
export { default as Callout } from './components/Callout';
export {
  default as UserLocation,
  UserLocationRenderMode,
} from './components/UserLocation';
export { default as VectorSource } from './components/VectorSource';
export { ShapeSource } from './components/ShapeSource';
export { default as RasterSource } from './components/RasterSource';
export { default as RasterDemSource } from './components/RasterDemSource';
export { default as ImageSource } from './components/ImageSource';
export { default as Images, type ImageEntry } from './components/Images';
export { default as Image } from './components/Image';
export { default as FillLayer } from './components/FillLayer';
export { default as FillExtrusionLayer } from './components/FillExtrusionLayer';
export { default as HeatmapLayer } from './components/HeatmapLayer';
export { default as LineLayer } from './components/LineLayer';
export { default as CircleLayer } from './components/CircleLayer';
export { default as SkyLayer } from './components/SkyLayer';
export { SymbolLayer } from './components/SymbolLayer';
export { default as RasterLayer } from './components/RasterLayer';
export { default as BackgroundLayer } from './components/BackgroundLayer';
export { Terrain } from './components/Terrain';
export {
  default as locationManager,
  type Location,
} from './modules/location/locationManager';
export {
  default as offlineManager,
  OfflineCreatePackOptions,
} from './modules/offline/offlineManager';
export {
  default as snapshotManager,
  type SnapshotOptions,
} from './modules/snapshot/snapshotManager';
export { default as MarkerView } from './components/MarkerView';

export { default as DummyShapeAnimator } from './shape_animators/DummyShapeAnimator';

export { default as Animated } from './utils/animated/Animated';
export {
  AnimatedCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  AnimatedPoint,
  AnimatedRouteCoordinatesArray,
  AnimatedShape,
} from './classes';
export { default as Style } from './components/Style';
export { default as Logger, type LogLevel } from './utils/Logger';
export { requestAndroidLocationPermissions } from './requestAndroidLocationPermissions';
export { getAnnotationsLayerID } from './utils/getAnnotationsLayerID';
export type {
  FillLayerStyleProps as FillLayerStyle,
  LineLayerStyleProps as LineLayerStyle,
  SymbolLayerStyleProps as SymbolLayerStyle,
  CircleLayerStyleProps as CircleLayerStyle,
  HeatmapLayerStyleProps as HeatmapLayerStyle,
  FillExtrusionLayerStyleProps as FillExtrusionLayerStyle,
  RasterLayerStyleProps as RasterLayerStyle,
  HillshadeLayerStyleProps as HillshadeLayerStyle,
  BackgroundLayerStyleProps as BackgroundLayerStyle,
  SkyLayerStyleProps as SkyLayerStyle,
  LightLayerStyleProps as LightLayerStyle,
  AtmosphereLayerStyleProps as AtmosphereLayerStyle,
  TerrainLayerStyleProps as TerrainLayerStyle,
} from './utils/MapboxStyles';

import { deprecatedClass } from './utils/deprecation';
import { AnimatedPoint } from './classes';
import { UserTrackingMode } from './components/Camera';

/** @deprecated This will be removed in a future release. Use `AnimatedPoint` instead. */
export const AnimatedMapPoint = deprecatedClass(
  AnimatedPoint,
  'AnimatedMapPoint is deprecated please use AnimatedPoint',
);

// types:
export enum StyleURL {
  Street = 'mapbox://styles/mapbox/streets-v11',
  Dark = 'mapbox://styles/mapbox/dark-v10',
  Light = 'mapbox://styles/mapbox/light-v10',
  Outdoors = 'mapbox://styles/mapbox/outdoors-v11',
  Satellite = 'mapbox://styles/mapbox/satellite-v9',
  SatelliteStreet = 'mapbox://styles/mapbox/satellite-streets-v11',
  TrafficDay = 'mapbox://styles/mapbox/navigation-preview-day-v4',
  TrafficNight = 'mapbox://styles/mapbox/navigation-preview-night-v4',
}

/** @deprecated UserTrackingModes is deprecated use UserTrackingMode */
export const UserTrackingModes = UserTrackingMode;
