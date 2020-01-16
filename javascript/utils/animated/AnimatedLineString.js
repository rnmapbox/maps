import { Animated } from 'react-native';

// Used react-native-maps as a reference
// https://github.com/react-community/react-native-maps/blob/master/lib/components/AnimatedRegion.js
const AnimatedWithChildren = Object.getPrototypeOf(Animated.ValueXY);

import AnimatedCoordinates from './AnimatedCoordinates';

const DEFAULT_COORD = [0, 0];

const DEFAULT_LINE = {
  type: 'LineString',
  coordinates: [DEFAULT_COORD, DEFAULT_COORD]
};

export class AnimatedLineString extends AnimatedWithChildren {
  constructor(line = DEFAULT_LINE) {
    super();

    //this._listeners = {};

    this.coordinates = [];

    line.coordinates.forEach((coord) => {
      this.coordinates.push(new AnimatedCoordinates(coord));
    });
  }

  flattenOffset() {
    this.coordinates.forEach((coord) => {
      coord.flattenOffset();
    });
  }

  stopAnimation(cb) {
    this.coordinates.forEach((coord) => {
      coord.stopAnimation();
    });

    if (typeof cb === 'function') {
      cb(this.__getValue());
    }
  }

  addListener(cb) {
    this.coordinates.forEach((coord) => {
      coord.addListener(cb);
    });
  }

  removeListener(id) {
    this.coordinates.forEach((coord) => {
      coord.removeListener(id);
    });
  }

  _last(items) {
    return items.length > 0 ? items[items.length - 1] : null;
  }

  _setup(coordinates) {
    const last = this._last(this.coordinates);

    let i = this.coordinates.length;

    while (i < coordinates.length) {
      this.coordinates.push(new AnimatedCoordinates(last.__getValue()));
      i++;
    }
  }

  _cleanup(coordinates) {
    while (this.coordinates.length > coordinates.length) {
      const popped = this.coordinates.pop();
    }
    super.__callListeners(this.__getValue());
  }

  animate(type, config) {
    const { coordinates, ...rest } = config;

    const last = this._last(coordinates);

    this._setup(coordinates);

    // Animate existing values
    let animations = coordinates.map((coord, i) => {
      return this.coordinates[i][type]({
        ...config,
        coordinates: coordinates[i]
      });
    });

    // Animate remaining values
    let i = coordinates.length;
    while (this.coordinates[i]) {
      animations.push(
        this.coordinates[i][type]({
          ...config,
          coordinates: last
        })
      );
      i++;
    }

    return Animated.parallel(animations);
  }

  runImmediate(type, coordinates) {
    this._setup(coordinates);

    this.coordinates.forEach((coord, i) => {
      coord[type](coordinates[i]);
    });

    this._cleanup(coordinates);
  }

  setValue(line) {
    this.runImmediate('setValue', line.coordinates);
  }

  setOffset(line) {
    this.runImmediate('setOffset', line.coordinates);
  }

  spring(config = { coordinates: DEFAULT_COORD }) {
    return this.animate('spring', config);
  }

  timing(config = { coordinates: DEFAULT_COORD }) {
    return this.animate('timing', config);
  }

  decay(config = { coordinates: DEFAULT_COORD }) {
    return this.animate('decay', config);
  }

  __getValue() {
    return {
      type: 'LineString',
      coordinates: this.coordinates.map((coord) => coord.__getValue())
    };
  }

  __attach() {
    this.coordinates.forEach((coord) => coord.__attach(this));
  }

  __detach() {
    this.coordinates.forEach((coord) => coord.__detach(this));
  }
}

export default AnimatedLineString;
