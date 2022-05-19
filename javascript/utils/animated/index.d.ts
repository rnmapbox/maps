import RN from 'react-native';

export class Animated {} // TODO

export class AnimatedPoint {
  constructor(point?: GeoJSON.Point);
  longitude: RN.Animated.Value;
  latitude: RN.Animated.Value;
  setValue: (point: GeoJSON.Point) => void;
  setOffset: (point: GeoJSON.Point) => void;
  flattenOffset: () => void;
  stopAnimation: (cb?: () => GeoJSON.Point) => void;
  addListener: (cb?: () => GeoJSON.Point) => void;
  removeListener: (id: string) => void;
  spring: (config: Record<string, any>) => RN.Animated.CompositeAnimation;
  timing: (config: Record<string, any>) => RN.Animated.CompositeAnimation;
}

export class AnimatedShape {} // TODO
export class AnimatedCoordinatesArray {} // TODO
export class AnimatedExtractCoordinateFromArray {} // TODO
export class AnimatedRouteCoordinatesArray {} // TODO
