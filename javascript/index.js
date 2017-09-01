import { NativeModules } from 'react-native';
import MapView from './components/MapView';
import * as geoUtils from './utils/geoUtils';

let MapboxGL = { ...NativeModules.MGLModule };

// components
MapboxGL.MapView = MapView;

// utils
MapboxGL.geoUtils = geoUtils;

export default MapboxGL;
