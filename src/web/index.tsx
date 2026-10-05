import 'mapbox-gl/dist/mapbox-gl.css';

import MapboxModule from './MapboxModule';
import UnimplementedComponent, {
  warnUnimplemented,
} from './UnimplementedComponent';
import Camera from './components/Camera';
import MapView from './components/MapView';
import MarkerView from './components/MarkerView';
import ShapeSource from './components/ShapeSource';
import {
  BackgroundLayer,
  CircleLayer,
  FillExtrusionLayer,
  FillLayer,
  HeatmapLayer,
  HillshadeLayer,
  LineLayer,
  ModelLayer,
  RasterLayer,
  RasterParticleLayer,
  SkyLayer,
  SymbolLayer,
} from './components/layers';
import Logger from './utils/Logger';
import {
  AnimatedCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  AnimatedPoint,
  AnimatedRouteCoordinatesArray,
  AnimatedShape,
} from '../classes';
import { getAnnotationsLayerID } from '../utils/getAnnotationsLayerID';
import { requestAndroidLocationPermissions } from '../requestAndroidLocationPermissions';

// Components without a web implementation yet. They render nothing, so
// screens using them still show the map.
const Atmosphere = UnimplementedComponent('Atmosphere');
const Snow = UnimplementedComponent('Snow');
const Rain = UnimplementedComponent('Rain');
const Light = UnimplementedComponent('Light');
const PointAnnotation = UnimplementedComponent('PointAnnotation');
const PointAnnotationManager = UnimplementedComponent('PointAnnotationManager');
const Annotation = UnimplementedComponent('Annotation');
const Callout = UnimplementedComponent('Callout');
const StyleImport = UnimplementedComponent('StyleImport');
const UserLocation = UnimplementedComponent('UserLocation');
const LocationPuck = UnimplementedComponent('LocationPuck');
const VectorSource = UnimplementedComponent('VectorSource');
const RasterSource = UnimplementedComponent('RasterSource');
const RasterArraySource = UnimplementedComponent('RasterArraySource');
const RasterDemSource = UnimplementedComponent('RasterDemSource');
const ImageSource = UnimplementedComponent('ImageSource');
const Viewport = UnimplementedComponent('Viewport');
const Models = UnimplementedComponent('Models');
const Images = UnimplementedComponent('Images');
const Image = UnimplementedComponent('Image');
const CustomLocationProvider = UnimplementedComponent('CustomLocationProvider');
const Terrain = UnimplementedComponent('Terrain');
const CameraGestureObserver = UnimplementedComponent('CameraGestureObserver');
const Style = UnimplementedComponent('Style');
const NativeUserLocation = LocationPuck;

const Animated = {
  ShapeSource,
  ImageSource,
  FillLayer,
  FillExtrusionLayer,
  LineLayer,
  CircleLayer,
  SymbolLayer,
  RasterLayer,
  BackgroundLayer,
};

const locationManager = {
  start(_displacement?: number) {
    warnUnimplemented('locationManager');
  },
  stop() {},
  addListener(_listener: unknown) {
    warnUnimplemented('locationManager');
  },
  removeListener(_listener: unknown) {},
  removeAllListeners() {},
  async getLastKnownLocation() {
    warnUnimplemented('locationManager');
    return null;
  },
  setMinDisplacement(_minDisplacement: number) {},
  setRequestsAlwaysUse(_requestsAlwaysUse: boolean) {},
  setLocationEventThrottle(_throttleValue: number) {},
};

// Modules that can't work on web: every method rejects with a clear error.
function unsupportedModule<T extends string>(name: string, methods: T[]) {
  const module = {} as Record<T, (...args: unknown[]) => Promise<never>>;
  for (const method of methods) {
    module[method] = async () => {
      throw new Error(
        `@rnmapbox/maps: ${name}.${method} is not supported on web`,
      );
    };
  }
  return module;
}

const offlineManager = unsupportedModule('offlineManager', [
  'clearAmbientCache',
  'createPack',
  'deletePack',
  'getPack',
  'getPacks',
  'invalidateAmbientCache',
  'invalidatePack',
  'mergeOfflineRegions',
  'migrateOfflineCache',
  'resetDatabase',
  'setMaximumAmbientCacheSize',
  'setProgressEventThrottle',
  'setTileCountLimit',
  'subscribe',
  'unsubscribe',
]);
const offlineManagerLegacy = offlineManager;
const snapshotManager = unsupportedModule('snapshotManager', ['takeSnap']);
const TileStore = unsupportedModule('TileStore', ['shared']);

class UnsupportedShapeAnimator {
  constructor(..._args: unknown[]) {
    warnUnimplemented('ShapeAnimator');
  }
}

const __experimental = {
  MovePointShapeAnimator: UnsupportedShapeAnimator,
  ChangeLineOffsetsShapeAnimator: UnsupportedShapeAnimator,
};

const ExportedComponents = {
  Camera,
  MapView,
  Logger,
  MarkerView,
  Atmosphere,
  Snow,
  Rain,
  Light,
  PointAnnotation,
  PointAnnotationManager,
  Annotation,
  Callout,
  StyleImport,
  UserLocation,
  LocationPuck,
  NativeUserLocation,
  VectorSource,
  ShapeSource,
  RasterSource,
  RasterArraySource,
  RasterDemSource,
  ImageSource,
  Viewport,
  Models,
  Images,
  Image,
  FillLayer,
  FillExtrusionLayer,
  HeatmapLayer,
  LineLayer,
  CircleLayer,
  SkyLayer,
  ModelLayer,
  SymbolLayer,
  RasterLayer,
  RasterParticleLayer,
  HillshadeLayer,
  BackgroundLayer,
  CustomLocationProvider,
  Terrain,
  CameraGestureObserver,
  Style,
  Animated,
  AnimatedCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  AnimatedPoint,
  AnimatedRouteCoordinatesArray,
  AnimatedShape,
  locationManager,
  offlineManager,
  offlineManagerLegacy,
  snapshotManager,
  TileStore,
  getAnnotationsLayerID,
  requestAndroidLocationPermissions,
  __experimental,
};

const Mapbox = {
  ...MapboxModule,
  ...ExportedComponents,
};

export {
  Camera,
  Logger,
  MapView,
  MarkerView,
  Atmosphere,
  Snow,
  Rain,
  Light,
  PointAnnotation,
  PointAnnotationManager,
  Annotation,
  Callout,
  StyleImport,
  UserLocation,
  LocationPuck,
  NativeUserLocation,
  VectorSource,
  ShapeSource,
  RasterSource,
  RasterArraySource,
  RasterDemSource,
  ImageSource,
  Viewport,
  Models,
  Images,
  Image,
  FillLayer,
  FillExtrusionLayer,
  HeatmapLayer,
  LineLayer,
  CircleLayer,
  SkyLayer,
  ModelLayer,
  SymbolLayer,
  RasterLayer,
  RasterParticleLayer,
  HillshadeLayer,
  BackgroundLayer,
  CustomLocationProvider,
  Terrain,
  CameraGestureObserver,
  Style,
  Animated,
  AnimatedCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  AnimatedPoint,
  AnimatedRouteCoordinatesArray,
  AnimatedShape,
  locationManager,
  offlineManager,
  offlineManagerLegacy,
  snapshotManager,
  TileStore,
  getAnnotationsLayerID,
  requestAndroidLocationPermissions,
  __experimental,
};

export * from './MapboxModule';

export default Mapbox;
