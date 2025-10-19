import { Animated } from 'react-native';
// @ts-ignore - Missing types for @turf packages
import along from '@turf/along';
// @ts-ignore - Missing types for @turf packages
import findDistance from '@turf/distance';
// @ts-ignore - Missing types for @turf packages
import { point } from '@turf/helpers';

class Polyline {
  // @ts-ignore - Parameter type requires TypeScript annotation
  constructor(lineStringFeature) {
    this._coordinates = lineStringFeature.geometry.coordinates;
    this._lineStringFeature = lineStringFeature;

    this._totalDistance = 0;
    for (let i = 1; i < this._coordinates.length; i++) {
      this._totalDistance += findDistance(this.get(i - 1), this.get(i));
    }
  }

  // @ts-ignore - Parameter type requires TypeScript annotation
  coordinateFromStart(distance) {
    const pointAlong = along(this._lineStringFeature, distance);
    pointAlong.properties.distance = distance;
    pointAlong.properties.nearestIndex = this.findNearestFloorIndex(distance);
    return pointAlong;
  }

  // @ts-ignore - Parameter type requires TypeScript annotation
  findNearestFloorIndex(currentDistance) {
    let runningDistance = 0;

    for (let i = 1; i < this._coordinates.length; i++) {
      runningDistance += findDistance(this.get(i - 1), this.get(i));

      if (runningDistance >= currentDistance) {
        return i - 1;
      }
    }

    return -1;
  }

  // @ts-ignore - Parameter type requires TypeScript annotation
  get(index) {
    return point(this._coordinates[index]);
  }

  get totalDistance() {
    return this._totalDistance;
  }
}

class RouteSimulator {
  // @ts-ignore - Parameter types require TypeScript annotation
  constructor(lineString, speed = 0.04) {
    this._polyline = new Polyline(lineString);
    this._previousDistance = 0;
    this._currentDistance = 0;
    this._speed = speed;
  }

  // @ts-ignore - Parameter type requires TypeScript annotation
  addListener(listener) {
    this._listener = listener;
  }

  start() {
    this.tick();
  }

  reset() {
    this._previousDistance = 0;
    this._currentDistance = 0;
    this.start();
  }

  stop() {
    if (this._anim) {
      this._anim.stop();
    }
  }

  tick() {
    requestAnimationFrame(() => {
      this._previousDistance = this._currentDistance;
      this._currentDistance += this._speed;

      // interpolate between previous to current distance
      // @ts-ignore - Parameter type requires TypeScript annotation
      const listener = (step) => {
        const currentPosition = this._polyline.coordinateFromStart(step.value);
        this.emit(currentPosition);
      };

      this._animatedValue = new Animated.Value(this._previousDistance);
      this._animatedValue.addListener(listener);

      this._anim = Animated.timing(this._animatedValue, {
        toValue: this._currentDistance,
        duration: 5,
        useNativeDriver: false,
      });

      this._anim.start(() => {
        this._animatedValue.removeListener(listener);

        if (this._currentDistance > this._polyline.totalDistance) {
          this.reset();
          return;
        }

        this.tick();
      });
    });
  }

  // @ts-ignore - Parameter type requires TypeScript annotation
  emit(pointFeature) {
    this._listener(pointFeature);
  }
}

export default RouteSimulator;
