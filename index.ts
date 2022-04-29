import { NativeModules, PermissionsAndroid } from 'react-native';
import {
  Expression,
  MapboxGLEvent,
  OnPressEvent,
  OrnamentPosition,
  WithExpression,
  TextVariableAnchorValues,
  MarkerViewProps,
  RegionPayload,
  MapState,
  MapViewProps,
  UserLocationProps,
  LightStyle,
  Transition,
  BackgroundLayerStyle,
  CircleLayerStyle,
  FillExtrusionLayerStyle,
  FillLayerStyle,
  LineLayerStyle,
  RasterLayerStyle,
  SymbolLayerStyle,
  HeatmapLayerStyle,
  Point,
  LightProps,
  PointAnnotationProps,
  StyleProps,
  CalloutProps,
  TileSourceProps,
  VectorSourceProps,
  ShapeSourceProps,
  RasterSourceProps,
  LayerBaseProps,
  BackgroundLayerProps,
  CircleLayerProps,
  FillExtrusionLayerProps,
  FillLayerProps,
  LineLayerProps,
  RasterLayerProps,
  HeatmapLayerProps,
  ImagesProps,
  ImageSourceProps,
  OfflineCreatePackOptions,
  SnapshotOptions,
} from 'definitions';

import { isAndroid } from './javascript/utils';
import MapView from './javascript/components/MapView';
import Light from './javascript/components/Light';
import PointAnnotation from './javascript/components/PointAnnotation';
import Annotation from './javascript/components/annotations/Annotation';
import Callout from './javascript/components/Callout';
import UserLocation from './javascript/components/UserLocation';
import Camera, {
  CameraProps,
  CameraRef,
  UserTrackingModes,
  AnimationMode,
} from './javascript/components/Camera';
import VectorSource from './javascript/components/VectorSource';
import ShapeSource from './javascript/components/ShapeSource';
import RasterSource from './javascript/components/RasterSource';
import RasterDemSource from './javascript/components/RasterDemSource';
import ImageSource from './javascript/components/ImageSource';
import Images from './javascript/components/Images';
import FillLayer from './javascript/components/FillLayer';
import FillExtrusionLayer from './javascript/components/FillExtrusionLayer';
import HeatmapLayer from './javascript/components/HeatmapLayer';
import LineLayer from './javascript/components/LineLayer';
import CircleLayer from './javascript/components/CircleLayer';
import SkyLayer from './javascript/components/SkyLayer';
import SymbolLayer from './javascript/components/SymbolLayer';
import RasterLayer from './javascript/components/RasterLayer';
import BackgroundLayer from './javascript/components/BackgroundLayer';
import Terrain from './javascript/components/Terrain';
import locationManager from './javascript/modules/location/locationManager';
import offlineManager from './javascript/modules/offline/offlineManager';
import snapshotManager from './javascript/modules/snapshot/snapshotManager';
import MarkerView from './javascript/components/MarkerView';
import Animated from './javascript/utils/animated/Animated';
import AnimatedPoint from './javascript/utils/animated/AnimatedPoint';
import AnimatedShape from './javascript/utils/animated/AnimatedShape';
import AnimatedCoordinatesArray from './javascript/utils/animated/AnimatedCoordinatesArray';
import AnimatedExtractCoordinateFromArray from './javascript/utils/animated/AnimatedExtractCoordinateFromArray';
import AnimatedRouteCoordinatesArray from './javascript/utils/animated/AnimatedRouteCoordinatesArray';
import Style from './javascript/components/Style';
import Logger from './javascript/utils/Logger';

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

const MapboxGL = {
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

export type {
  // TS types
  CameraProps,
  CameraRef,
  AnimationMode,
  // JS definitions
  Expression,
  MapboxGLEvent,
  OnPressEvent,
  OrnamentPosition,
  WithExpression,
  TextVariableAnchorValues,
  MarkerViewProps,
  RegionPayload,
  MapState,
  MapViewProps,
  UserLocationProps,
  LightStyle,
  Transition,
  BackgroundLayerStyle,
  CircleLayerStyle,
  FillExtrusionLayerStyle,
  FillLayerStyle,
  LineLayerStyle,
  RasterLayerStyle,
  SymbolLayerStyle,
  HeatmapLayerStyle,
  Point,
  LightProps,
  PointAnnotationProps,
  StyleProps,
  CalloutProps,
  TileSourceProps,
  VectorSourceProps,
  ShapeSourceProps,
  RasterSourceProps,
  LayerBaseProps,
  BackgroundLayerProps,
  CircleLayerProps,
  FillExtrusionLayerProps,
  FillLayerProps,
  LineLayerProps,
  RasterLayerProps,
  HeatmapLayerProps,
  ImagesProps,
  ImageSourceProps,
  OfflineCreatePackOptions,
  SnapshotOptions,
};

export default MapboxGL;
