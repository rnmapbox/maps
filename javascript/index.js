import {Animated, NativeModules, PermissionsAndroid} from 'react-native';

import {isAndroid} from './utils';
import * as geoUtils from './utils/geoUtils';
import MapView from './components/MapView';
import Light from './components/Light';
import PointAnnotation from './components/PointAnnotation';
import Annotation from './components/annotations/Annotation'; // eslint-disable-line import/no-cycle
import Callout from './components/Callout';
import UserLocation from './components/UserLocation'; // eslint-disable-line import/no-cycle
import Camera from './components/Camera';
import VectorSource from './components/VectorSource';
import ShapeSource from './components/ShapeSource';
import RasterSource from './components/RasterSource';
import ImageSource from './components/ImageSource';
import Images from './components/Images';
import FillLayer from './components/FillLayer';
import FillExtrusionLayer from './components/FillExtrusionLayer';
import HeatmapLayer from './components/HeatmapLayer';
import LineLayer from './components/LineLayer';
import CircleLayer from './components/CircleLayer';
import SymbolLayer from './components/SymbolLayer';
import RasterLayer from './components/RasterLayer';
import BackgroundLayer from './components/BackgroundLayer';
import locationManager from './modules/location/locationManager';
import offlineManager from './modules/offline/offlineManager';
import snapshotManager from './modules/snapshot/snapshotManager';
import AnimatedMapPoint from './utils/AnimatedPoint';

const MapboxGL = {...NativeModules.MGLModule};

// static methods
MapboxGL.requestAndroidLocationPermissions = async function() {
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
      if (res[permission] === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }
    }

    return false;
  }

  throw new Error('You should only call this method on Android!');
};

MapboxGL.UserTrackingModes = Camera.UserTrackingModes;

// components
MapboxGL.MapView = MapView;
MapboxGL.Light = Light;
MapboxGL.PointAnnotation = PointAnnotation;
MapboxGL.Callout = Callout;
MapboxGL.UserLocation = UserLocation;
MapboxGL.Camera = Camera;

// annotations
MapboxGL.Annotation = Annotation;

// sources
MapboxGL.VectorSource = VectorSource;
MapboxGL.ShapeSource = ShapeSource;
MapboxGL.RasterSource = RasterSource;
MapboxGL.ImageSource = ImageSource;
MapboxGL.Images = Images;

// layers
MapboxGL.FillLayer = FillLayer;
MapboxGL.FillExtrusionLayer = FillExtrusionLayer;
MapboxGL.HeatmapLayer = HeatmapLayer;
MapboxGL.LineLayer = LineLayer;
MapboxGL.CircleLayer = CircleLayer;
MapboxGL.SymbolLayer = SymbolLayer;
MapboxGL.RasterLayer = RasterLayer;
MapboxGL.BackgroundLayer = BackgroundLayer;

// modules
MapboxGL.locationManager = locationManager;
MapboxGL.offlineManager = offlineManager;
MapboxGL.snapshotManager = snapshotManager;

// utils
MapboxGL.geoUtils = geoUtils;
MapboxGL.AnimatedPoint = AnimatedMapPoint;

// animated
MapboxGL.Animated = {
  // sources
  ShapeSource: Animated.createAnimatedComponent(ShapeSource),
  ImageSource: Animated.createAnimatedComponent(ImageSource),

  // layers
  FillLayer: Animated.createAnimatedComponent(FillLayer),
  FillExtrusionLayer: Animated.createAnimatedComponent(FillExtrusionLayer),
  LineLayer: Animated.createAnimatedComponent(LineLayer),
  CircleLayer: Animated.createAnimatedComponent(CircleLayer),
  SymbolLayer: Animated.createAnimatedComponent(SymbolLayer),
  RasterLayer: Animated.createAnimatedComponent(RasterLayer),
  BackgroundLayer: Animated.createAnimatedComponent(BackgroundLayer),
};

export default MapboxGL;
