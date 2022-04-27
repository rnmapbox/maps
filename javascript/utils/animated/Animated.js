import { Animated as RNAnimated } from 'react-native';

import ShapeSource from '../../components/ShapeSource';
import ImageSource from '../../components/ImageSource';
import FillLayer from '../../components/FillLayer';
import FillExtrusionLayer from '../../components/FillExtrusionLayer';
import LineLayer from '../../components/LineLayer';
import CircleLayer from '../../components/CircleLayer';
import SymbolLayer from '../../components/SymbolLayer';
import RasterLayer from '../../components/RasterLayer';
import BackgroundLayer from '../../components/BackgroundLayer';

import AnimatedShape from './AnimatedShape';
import AnimatedCoordinatesArray from './AnimatedCoordinatesArray';
import AnimatedExtractCoordinateFromArray from './AnimatedExtractCoordinateFromArray';
import AnimatedRouteCoordinatesArray from './AnimatedRouteCoordinatesArray';

const Animated = {
  // sources
  ShapeSource: RNAnimated.createAnimatedComponent(ShapeSource),
  ImageSource: RNAnimated.createAnimatedComponent(ImageSource),

  // layers
  FillLayer: RNAnimated.createAnimatedComponent(FillLayer),
  FillExtrusionLayer: RNAnimated.createAnimatedComponent(FillExtrusionLayer),
  LineLayer: RNAnimated.createAnimatedComponent(LineLayer),
  CircleLayer: RNAnimated.createAnimatedComponent(CircleLayer),
  SymbolLayer: RNAnimated.createAnimatedComponent(SymbolLayer),
  RasterLayer: RNAnimated.createAnimatedComponent(RasterLayer),
  BackgroundLayer: RNAnimated.createAnimatedComponent(BackgroundLayer),

  // values
  CoordinatesArray: AnimatedCoordinatesArray,
  RouteCoordinatesArray: AnimatedRouteCoordinatesArray,
  Shape: AnimatedShape,
  ExtractCoordinateFromArray: AnimatedExtractCoordinateFromArray,
};

export default Animated;
