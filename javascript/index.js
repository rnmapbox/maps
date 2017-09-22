import { NativeModules } from 'react-native';
import * as geoUtils from './utils/geoUtils';

// components
import MapView from './components/MapView';
import MapboxStyleSheet from './utils/MapboxStyleSheet';

// sources
import VectorSource from './components/VectorSource';
import ShapeSource from './components/ShapeSource';

// layers
import FillLayer from './components/FillLayer';
import FillExtrusionLayer from './components/FillExtrusionLayer';
import LineLayer from './components/LineLayer';
import CircleLayer from './components/CircleLayer';
import SymbolLayer from './components/SymbolLayer';

let MapboxGL = { ...NativeModules.MGLModule };

// components
MapboxGL.MapView = MapView;
MapboxGL.StyleSheet = MapboxStyleSheet;

// sources
MapboxGL.VectorSource = VectorSource;
MapboxGL.ShapeSource = ShapeSource;

// layers
MapboxGL.FillLayer = FillLayer;
MapboxGL.FillExtrusionLayer = FillExtrusionLayer;
MapboxGL.LineLayer = LineLayer;
MapboxGL.CircleLayer = CircleLayer;
MapboxGL.SymbolLayer = SymbolLayer;

// utils
MapboxGL.geoUtils = geoUtils;

export default MapboxGL;
