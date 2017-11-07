import { Animated, NativeModules, PermissionsAndroid } from 'react-native';
import { IS_ANDROID } from './utils';
import * as geoUtils from './utils/geoUtils';

// components
import MapView from './components/MapView';
import MapboxStyleSheet from './utils/MapboxStyleSheet';
import Light from './components/Light';
import PointAnnotation from './components/PointAnnotation';
import Callout from './components/Callout';

// sources
import VectorSource from './components/VectorSource';
import ShapeSource from './components/ShapeSource';
import RasterSource from './components/RasterSource';

// layers
import FillLayer from './components/FillLayer';
import FillExtrusionLayer from './components/FillExtrusionLayer';
import LineLayer from './components/LineLayer';
import CircleLayer from './components/CircleLayer';
import SymbolLayer from './components/SymbolLayer';
import RasterLayer from './components/RasterLayer';
import BackgroundLayer from './components/BackgroundLayer';

// modules
import offlineManager from './modules/offline/offlineManager';

let MapboxGL = { ...NativeModules.MGLModule };

// static methods
MapboxGL.requestAndroidLocationPermissions = async function () {
  if (IS_ANDROID) {
    const res = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    if (!res) {
      return false;
    }

    const permissions = Object.keys(res);
    for (let permission of permissions) {
      if (res[permission] === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }
    }

    return false;
  }

  throw new Error('You should only call this method on Android!');
};

// components
MapboxGL.MapView = MapView;
MapboxGL.StyleSheet = MapboxStyleSheet;
MapboxGL.Light = Light;
MapboxGL.PointAnnotation = PointAnnotation;
MapboxGL.Callout = Callout;

// sources
MapboxGL.VectorSource = VectorSource;
MapboxGL.ShapeSource = ShapeSource;
MapboxGL.RasterSource = RasterSource;

// layers
MapboxGL.FillLayer = FillLayer;
MapboxGL.FillExtrusionLayer = FillExtrusionLayer;
MapboxGL.LineLayer = LineLayer;
MapboxGL.CircleLayer = CircleLayer;
MapboxGL.SymbolLayer = SymbolLayer;
MapboxGL.RasterLayer = RasterLayer;
MapboxGL.BackgroundLayer = BackgroundLayer;

// modules
MapboxGL.offlineManager = offlineManager;

// utils
MapboxGL.geoUtils = geoUtils;

// animated
MapboxGL.Animated = {
  // sources
  ShapeSource: Animated.createAnimatedComponent(ShapeSource),

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
