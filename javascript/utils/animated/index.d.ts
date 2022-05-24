import RN from 'react-native';

export class AnimatedPoint {}
export class AnimatedShape {} // TODO
export class AnimatedCoordinatesArray {} // TODO
export class AnimatedExtractCoordinateFromArray {} // TODO
export class AnimatedRouteCoordinatesArray {} // TODO

export const Animated = {
  ShapeSource: RN.AnimatedComponent,
  ImageSource: RN.AnimatedComponent,
  FillLayer: RN.AnimatedComponent,
  FillExtrusionLayer: RN.AnimatedComponent,
  LineLayer: RN.AnimatedComponent,
  CircleLayer: RN.AnimatedComponent,
  SymbolLayer: RN.AnimatedComponent,
  RasterLayer: RN.AnimatedComponent,
  BackgroundLayer: RN.AnimatedComponent,
  CoordinatesArray: RN.AnimatedComponent,
  RouteCoordinatesArray: RN.AnimatedComponent,
  Shape: RN.AnimatedComponent,
  ExtractCoordinateFromArray: RN.AnimatedComponent,
};
