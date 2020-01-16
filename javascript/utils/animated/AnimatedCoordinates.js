import { Animated } from 'react-native';

// Used react-native-maps as a reference
// https://github.com/react-community/react-native-maps/blob/master/lib/components/AnimatedRegion.js
const AnimatedWithChildren = Object.getPrototypeOf(Animated.ValueXY);

let uniqueID = 0;

export class AnimatedCoordinates extends AnimatedWithChildren {
  constructor(coordinates) {
    super();

    this.longitude = coordinates[0];
    this.latitude = coordinates[1];

    if (!(this.longitude instanceof Animated.Value)) {
      this.longitude = new Animated.Value(this.longitude);
    }

    if (!(this.latitude instanceof Animated.Value)) {
      this.latitude = new Animated.Value(this.latitude);
    }

    this._listeners = {};
  }

  setValue(coordinates) {
    this.longitude.setValue(coordinates[0]);
    this.latitude.setValue(coordinates[1]);
  }

  setOffset(coordinates) {
    this.longitude.setOffset(coordinates[0]);
    this.latitude.setOffset(coordinates[1]);
  }

  flattenOffset() {
    this.longitude.flattenOffset();
    this.latitude.flattenOffset();
  }

  stopAnimation(cb) {
    this.longitude.stopAnimation();
    this.latitude.stopAnimation();

    if (typeof cb === 'function') {
      cb(this.__getValue());
    }
  }

  addListener(cb) {
    uniqueID += 1;
    const id = `${String(uniqueID)}-${String(Date.now())}`;

    const completeCB = () => {
      if (typeof cb === 'function') {
        cb(this.__getValue());
      }
    };

    this._listeners[id] = {
      longitude: this.longitude.addListener(completeCB),
      latitude: this.latitude.addListener(completeCB)
    };

    return id;
  }

  removeListener(id) {
    this.longitude.removeListener(this._listeners[id].longitude);
    this.latitude.removeListener(this._listeners[id].latitude);
    delete this._listeners[id];
  }

  animate(type, config) {
    return Animated.parallel([
      Animated[type](this.longitude, {
        ...config,
        toValue: config.coordinates[0]
      }),
      Animated[type](this.latitude, {
        ...config,
        toValue: config.coordinates[1]
      })
    ]);
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
    return [this.longitude.__getValue(), this.latitude.__getValue()];
  }

  __attach(self) {
    this.longitude.__addChild(self || this);
    this.latitude.__addChild(self || this);
  }

  __detach(self) {
    this.longitude.__removeChild(self || this);
    this.latitude.__removeChild(self || this);
  }
}

export default AnimatedCoordinates;
