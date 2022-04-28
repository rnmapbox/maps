import { NativeModules, PermissionsAndroid } from 'react-native';

import { isAndroid } from './utils';
import MapView from './components/MapView';
import Light from './components/Light';
import PointAnnotation from './components/PointAnnotation';
import Annotation from './components/annotations/Annotation';
import Callout from './components/Callout';
import UserLocation from './components/UserLocation';
import Camera, {
  CameraProps,
  CameraRef,
  UserTrackingModes,
  AnimationMode,
} from './components/Camera';
import VectorSource from './components/VectorSource';
import ShapeSource from './components/ShapeSource';
import RasterSource from './components/RasterSource';
import RasterDemSource from './components/RasterDemSource';
import ImageSource from './components/ImageSource';
import Images from './components/Images';
import FillLayer from './components/FillLayer';
import FillExtrusionLayer from './components/FillExtrusionLayer';
import HeatmapLayer from './components/HeatmapLayer';
import LineLayer from './components/LineLayer';
import CircleLayer from './components/CircleLayer';
import SkyLayer from './components/SkyLayer';
import SymbolLayer from './components/SymbolLayer';
import RasterLayer from './components/RasterLayer';
import BackgroundLayer from './components/BackgroundLayer';
import Terrain from './components/Terrain';
import locationManager from './modules/location/locationManager';
import offlineManager from './modules/offline/offlineManager';
import snapshotManager from './modules/snapshot/snapshotManager';
import MarkerView from './components/MarkerView';
import Animated from './utils/animated/Animated';
import AnimatedPoint from './utils/animated/AnimatedPoint';
import AnimatedShape from './utils/animated/AnimatedShape';
import AnimatedCoordinatesArray from './utils/animated/AnimatedCoordinatesArray';
import AnimatedExtractCoordinateFromArray from './utils/animated/AnimatedExtractCoordinateFromArray';
import AnimatedRouteCoordinatesArray from './utils/animated/AnimatedRouteCoordinatesArray';
import Style from './components/Style';
import Logger from './utils/Logger';

const requestAndroidLocationPermissions = async function () {
  if (isAndroid()) {
    const res = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    if (!res) {
      return false;
    }

    const permissions = Object.keys(res);
    for (const permission of permissions) {
      // @ts-expect-error TODO: Use Android permissions type.
      if (res[permission] === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }
    }

    return false;
  }

  throw new Error('You should only call this method on Android!');
};

const MapboxGL: Record<string, any> = {
  ...NativeModules.MGLModule,
  requestAndroidLocationPermissions,
  UserTrackingModes,
  MapView,
  Light,
  PointAnnotation,
  Callout,
  UserLocation,
  Camera,
  Style,
  Annotation,
  MarkerView,
  VectorSource,
  ShapeSource,
  RasterSource,
  ImageSource,
  Images,
  RasterDemSource,
  FillLayer,
  FillExtrusionLayer,
  HeatmapLayer,
  LineLayer,
  CircleLayer,
  SkyLayer,
  SymbolLayer,
  RasterLayer,
  BackgroundLayer,
  Terrain,
  locationManager,
  offlineManager,
  snapshotManager,
  Animated,
  AnimatedPoint,
  AnimatedCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  AnimatedRouteCoordinatesArray,
  AnimatedShape,
  Logger,
};

export {
  requestAndroidLocationPermissions,
  UserTrackingModes,
  MapView,
  Light,
  PointAnnotation,
  Callout,
  UserLocation,
  Camera,
  Style,
  Annotation,
  MarkerView,
  VectorSource,
  ShapeSource,
  RasterSource,
  ImageSource,
  Images,
  RasterDemSource,
  FillLayer,
  FillExtrusionLayer,
  HeatmapLayer,
  LineLayer,
  CircleLayer,
  SkyLayer,
  SymbolLayer,
  RasterLayer,
  BackgroundLayer,
  Terrain,
  locationManager,
  offlineManager,
  snapshotManager,
  Animated,
  AnimatedPoint,
  AnimatedCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  AnimatedRouteCoordinatesArray,
  AnimatedShape,
  Logger,
};

export type { CameraProps, CameraRef, AnimationMode };

export default MapboxGL;
