import { Animated } from 'react-native';

// Used react-native-maps as a reference
// https://github.com/react-community/react-native-maps/blob/master/lib/components/AnimatedRegion.js
const AnimatedWithChildren = Object.getPrototypeOf(Animated.ValueXY);

const DEFAULT_COORD = [0, 0];
const DEFAULT_POINT = { type: 'Point', coordinates: DEFAULT_COORD };

let uniqueID = 0;

export class AnimatedPoint extends AnimatedWithChildren {
  constructor(point = DEFAULT_POINT) {
    super();

    this.longitude = point.coordinates[0] || 0;
    this.latitude = point.coordinates[1] || 0;

    if (!(this.longitude instanceof Animated.Value)) {
      this.longitude = new Animated.Value(this.longitude);
    }

    if (!(this.latitude instanceof Animated.Value)) {
      this.latitude = new Animated.Value(this.latitude);
    }

    // React Native < 0.83 uses object, >= 0.83 uses Map
    // We only initialize to object if super didn't initialize it (or initiated it to empty object/null)
    // and we want to preserve the type if it is a Map.
    if (!this._listeners) {
      this._listeners = {};
    }
  }

  setValue(point = DEFAULT_POINT) {
    this.longitude.setValue(point.coordinates[0]);
    this.latitude.setValue(point.coordinates[1]);
  }

  setOffset(point = DEFAULT_POINT) {
    this.longitude.setOffset(point.coordinates[0]);
    this.latitude.setOffset(point.coordinates[1]);
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

    const listener = {
      longitude: this.longitude.addListener(completeCB),
      latitude: this.latitude.addListener(completeCB),
    };

    if (this._listeners instanceof Map) {
      this._listeners.set(id, listener);
    } else {
      this._listeners[id] = listener;
    }

    return id;
  }

  removeListener(id) {
    if (this._listeners instanceof Map) {
      const listener = this._listeners.get(id);
      if (listener) {
        this.longitude.removeListener(listener.longitude);
        this.latitude.removeListener(listener.latitude);
        this._listeners.delete(id);
      }
    } else {
      const listener = this._listeners[id];
      if (listener) {
        this.longitude.removeListener(listener.longitude);
        this.latitude.removeListener(listener.latitude);
        delete this._listeners[id];
      }
    }
  }

  spring(config = { coordinates: DEFAULT_COORD }) {
    return Animated.parallel([
      Animated.spring(this.longitude, {
        ...config,
        toValue: config.coordinates[0],
        useNativeDriver: false,
      }),
      Animated.spring(this.latitude, {
        ...config,
        toValue: config.coordinates[1],
        useNativeDriver: false,
      }),
    ]);
  }

  timing(config = { coordinates: DEFAULT_COORD }) {
    return Animated.parallel([
      Animated.timing(this.longitude, {
        ...config,
        toValue: config.coordinates[0],
        useNativeDriver: false,
      }),
      Animated.timing(this.latitude, {
        ...config,
        toValue: config.coordinates[1],
        useNativeDriver: false,
      }),
    ]);
  }

  __getValue() {
    return {
      type: 'Point',
      coordinates: [this.longitude.__getValue(), this.latitude.__getValue()],
    };
  }

  __attach() {
    this.longitude.__addChild(this);
    this.latitude.__addChild(this);
  }

  __detach() {
    this.longitude.__removeChild(this);
    this.latitude.__removeChild(this);
  }
}

export default AnimatedPoint;
