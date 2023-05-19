import { Point } from 'geojson';
import { Animated } from 'react-native';

import WithAnimatedObject = Animated.WithAnimatedObject;

export class AnimatedCoordinatesArray {}
export class AnimatedExtractCoordinateFromArray {}
export class AnimatedPoint implements WithAnimatedObject<Point> {
  constructor(point: Point);

  timing({
    coordinates,
    easing,
    duration,
  }: {
    coordinates: number[];
    easing?: (x: number) => number;
    duration?: number;
  });

  stopAnimation();
}
export class AnimatedRouteCoordinatesArray {}
export class AnimatedShape {}
