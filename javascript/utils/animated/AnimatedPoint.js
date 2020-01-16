import { Animated } from 'react-native';

// Used react-native-maps as a reference
// https://github.com/react-community/react-native-maps/blob/master/lib/components/AnimatedRegion.js
const AnimatedWithChildren = Object.getPrototypeOf(Animated.ValueXY);

import AnimatedCoordinates from './AnimatedCoordinates';

const DEFAULT_COORD = [0, 0];
const DEFAULT_POINT = { type: 'Point', coordinates: DEFAULT_COORD };

export class AnimatedPoint extends AnimatedWithChildren {
  constructor(point = DEFAULT_POINT) {
    super();

    this.coordinates = new AnimatedCoordinates(point.coordinates);

    this._listeners = {};
  }

  setValue(point = DEFAULT_POINT) {
    this.coordinates.setValue(point.coordinates);
  }

  setOffset(point = DEFAULT_POINT) {
    this.coordinates.setOffset(point.coordinates);
  }

  flattenOffset() {
    this.coordinates.flattenOffset();
  }

  stopAnimation(cb) {
    this.coordinates.stopAnimation();

    if (typeof cb === 'function') {
      cb(this.__getValue());
    }
  }

  addListener(cb) {
    return this.coordinates.addListener(cb);
  }

  removeListener(id) {
    return this.coordinates.removeListener(id);
  }

  spring(config = { coordinates: DEFAULT_COORD }) {
    return this.coordinates.spring(config);
  }

  timing(config = { coordinates: DEFAULT_COORD }) {
    return this.coordinates.timing(config);
  }

  __getValue() {
    return {
      type: 'Point',
      coordinates: this.coordinates.__getValue()
    };
  }

  __attach() {
    this.coordinates.__attach(this);
  }

  __detach() {
    this.coordinates.__detach(this);
  }
}

export default AnimatedPoint;
