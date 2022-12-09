import { NativeModules } from 'react-native';

import { Camera, UserTrackingMode } from './components/Camera';
import { Atmosphere } from './components/Atmosphere';
import MapView from './components/MapView';
import Light from './components/Light';
import PointAnnotation from './components/PointAnnotation';
import Annotation from './components/annotations/Annotation';
import Callout from './components/Callout';
import UserLocation from './components/UserLocation';
import VectorSource from './components/VectorSource';
import { ShapeSource } from './components/ShapeSource';
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
import { SymbolLayer } from './components/SymbolLayer';
import RasterLayer from './components/RasterLayer';
import BackgroundLayer from './components/BackgroundLayer';
import { Terrain } from './components/Terrain';
import locationManager from './modules/location/locationManager';
import offlineManager from './modules/offline/offlineManager';
import snapshotManager from './modules/snapshot/snapshotManager';
import MarkerView from './components/MarkerView';
import Animated from './utils/animated/Animated';
import {
  AnimatedCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  AnimatedPoint,
  AnimatedRouteCoordinatesArray,
  AnimatedShape,
} from './classes';
import Style from './components/Style';
import Logger from './utils/Logger';
import { deprecatedClass } from './utils/deprecation';
import { requestAndroidLocationPermissions } from './requestAndroidLocationPermissions';
import { getAnnotationsLayerID } from './utils/getAnnotationsLayerID';

const MapboxGL = { ...NativeModules.MGLModule };

// static methods
MapboxGL.requestAndroidLocationPermissions = requestAndroidLocationPermissions;
MapboxGL.UserTrackingModes = UserTrackingMode;

// components
MapboxGL.MapView = MapView;
MapboxGL.Light = Light;
MapboxGL.PointAnnotation = PointAnnotation;
MapboxGL.Callout = Callout;
MapboxGL.UserLocation = UserLocation;
MapboxGL.Camera = Camera;
MapboxGL.Style = Style;

// classes
MapboxGL.AnimatedPoint = AnimatedPoint;
MapboxGL.AnimatedMapPoint = deprecatedClass(
  AnimatedPoint,
  'AnimatedMapPoint is deprecated please use AnimatedPoint',
);
MapboxGL.AnimatedShape = AnimatedShape;
MapboxGL.AnimatedCoordinatesArray = AnimatedCoordinatesArray;
MapboxGL.AnimatedExtractCoordinateFromArray =
  AnimatedExtractCoordinateFromArray;
MapboxGL.AnimatedRouteCoordinatesArray = AnimatedRouteCoordinatesArray;

// annotations
MapboxGL.Annotation = Annotation;
MapboxGL.MarkerView = MarkerView;

// sources
MapboxGL.VectorSource = VectorSource;
MapboxGL.ShapeSource = ShapeSource;
MapboxGL.RasterSource = RasterSource;
MapboxGL.ImageSource = ImageSource;
MapboxGL.Images = Images;
MapboxGL.RasterDemSource = RasterDemSource;

// layers
MapboxGL.FillLayer = FillLayer;
MapboxGL.FillExtrusionLayer = FillExtrusionLayer;
MapboxGL.HeatmapLayer = HeatmapLayer;
MapboxGL.LineLayer = LineLayer;
MapboxGL.CircleLayer = CircleLayer;
MapboxGL.SkyLayer = SkyLayer;
MapboxGL.SymbolLayer = SymbolLayer;
MapboxGL.RasterLayer = RasterLayer;
MapboxGL.BackgroundLayer = BackgroundLayer;

MapboxGL.Terrain = Terrain;
MapboxGL.Atmosphere = Atmosphere;

// modules
MapboxGL.locationManager = locationManager;
MapboxGL.offlineManager = offlineManager;
MapboxGL.snapshotManager = snapshotManager;

// animated
MapboxGL.Animated = Animated;
MapboxGL.Animated.RouteCoordinatesArray = AnimatedRouteCoordinatesArray; // For backwards compatibiilty.
MapboxGL.Animated.ExtractCoordinateFromArray =
  AnimatedExtractCoordinateFromArray; // For backwards compatibiilty.

// utils
MapboxGL.Logger = Logger;
MapboxGL.getAnnotationsLayerID = getAnnotationsLayerID;

const { LineJoin } = MapboxGL;

const AnimatedMapPoint = AnimatedPoint; // For backwards compatibiilty.

export {
  MapView,
  Light,
  PointAnnotation,
  Callout,
  UserLocation,
  Camera,
  Annotation,
  MarkerView,
  VectorSource,
  ShapeSource,
  RasterSource,
  RasterDemSource,
  ImageSource,
  Images,
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
  Atmosphere,
  AnimatedCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  AnimatedPoint,
  AnimatedMapPoint,
  AnimatedRouteCoordinatesArray,
  AnimatedShape,
  locationManager,
  offlineManager,
  snapshotManager,
  Animated,
  LineJoin,
  Logger,
  getAnnotationsLayerID,
  Style,
};

export default MapboxGL;
