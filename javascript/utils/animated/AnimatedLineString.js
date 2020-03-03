import {Animated} from 'react-native';

import AnimatedCoordinates from './AnimatedCoordinates';

// Used react-native-maps as a reference
// https://github.com/react-community/react-native-maps/blob/master/lib/components/AnimatedRegion.js
// https://github.com/facebook/react-native/blob/master/Libraries/Animated/src/nodes/AnimatedWithChildren.js
const AnimatedWithChildren = Object.getPrototypeOf(Animated.ValueXY);
if (__DEV__) {
  if (AnimatedWithChildren.name !== 'AnimatedWithChildren') {
    console.error(
      'AnimatedRegion could not obtain AnimatedWithChildren base class',
    );
  }
}

const DEFAULT_COORD = [0, 0];

const DEFAULT_LINE = {
  type: 'LineString',
  coordinates: [DEFAULT_COORD, DEFAULT_COORD],
};

export class AnimatedLineString extends AnimatedWithChildren {
  constructor(line = DEFAULT_LINE) {
    super();

    this.coordinates = line.coordinates.map(
      coord => new AnimatedCoordinates(coord),
    );
  }

  flattenOffset() {
    this.coordinates.forEach(coord => {
      coord.flattenOffset();
    });
  }

  stopAnimation(cb) {
    this.coordinates.forEach(coord => {
      coord.stopAnimation();
    });

    if (typeof cb === 'function') {
      cb(this.__getValue());
    }
  }

  resetAnimation() {
    this.coordinates.forEach(coord => {
      coord.resetAnimation();
    });
  }

  addListener(cb) {
    this.coordinates.forEach(coord => {
      coord.addListener(cb);
    });
  }

  removeListener(id) {
    this.coordinates.forEach(coord => {
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
      this.coordinates.pop();
    }
    super.__callListeners(this.__getValue());
  }

  _onAnimationDone(animation, doneCB) {
    return new Proxy(animation, {
      get(obj, prop) {
        if (prop === 'start') {
          return function start(origDoneCB, ...args) {
            return obj.start((startParams, ...startArgs) => {
              doneCB(startParams);
              if (origDoneCB) {
                origDoneCB(startParams, ...startArgs);
              }
            }, ...args);
          };
        }
        return obj[prop];
      },
    });
  }

  animate(type, config) {
    const {coordinates, ...rest} = config;
    const last = this._last(coordinates);

    this._setup(coordinates);

    // Animate existing values
    const animations = coordinates.map((coord, i) => {
      return this.coordinates[i][type]({
        ...config,
        coordinates: coordinates[i],
      });
    });

    // Animate remaining values
    let i = coordinates.length;
    while (this.coordinates[i]) {
      animations.push(
        this.coordinates[i][type]({
          ...config,
          coordinates: last,
        }),
      );
      i++;
    }

    return this._onAnimationDone(
      Animated.parallel(animations),
      ({finished}) => {
        if (finished) {
          this._cleanup(coordinates);
        }
      },
    );
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

  spring(config = {coordinates: DEFAULT_COORD}) {
    return this.animate('spring', config);
  }

  timing(config = {coordinates: DEFAULT_COORD}) {
    return this.animate('timing', config);
  }

  decay(config = {coordinates: DEFAULT_COORD}) {
    return this.animate('decay', config);
  }

  __getValue() {
    return {
      type: 'LineString',
      coordinates: this.coordinates.map(coord => coord.__getValue()),
    };
  }

  __attach() {
    this.coordinates.forEach(coord => coord.__attach(this));
  }

  __detach() {
    this.coordinates.forEach(coord => coord.__detach(this));
  }
}

export default AnimatedLineString;
