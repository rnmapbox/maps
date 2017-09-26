import { NativeModules } from 'react-native';
import * as geoUtils from './utils/geoUtils';

// components
import MapView from './components/MapView';
import MapboxStyleSheet from './utils/MapboxStyleSheet';
import Light from './components/Light';

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

let MapboxGL = { ...NativeModules.MGLModule };

// components
MapboxGL.MapView = MapView;
MapboxGL.StyleSheet = MapboxStyleSheet;
MapboxGL.Light = Light;

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

// utils
MapboxGL.geoUtils = geoUtils;

export default MapboxGL;
