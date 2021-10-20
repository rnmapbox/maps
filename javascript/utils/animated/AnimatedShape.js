import {Animated} from 'react-native';

// see
// https://github.com/facebook/react-native/blob/master/Libraries/Animated/src/nodes/AnimatedWithChildren.js
const AnimatedWithChildren = Object.getPrototypeOf(Animated.ValueXY);
if (__DEV__) {
  if (AnimatedWithChildren.name !== 'AnimatedWithChildren') {
    console.error(
      'AnimatedShape could not obtain AnimatedWithChildren base class',
    );
  }
}

/**
 * AnimatedShape can be used to have animated properties inside the shape property
 * @example
 * <AnimatedShapeSource ... shape={new AnimatedShape({type:'LineString', coordinates: animatedCoords})} />
 */
class AnimatedShape extends AnimatedWithChildren {
  // equivalent of AnimatedStyle for shapes
  // https://github.com/facebook/react-native/blob/master/Libraries/Animated/src/nodes/AnimatedStyle.js

  constructor(shape) {
    super();
    this.shape = shape;
  }

  _walkShapeAndGetValues(value) {
    if (Array.isArray(value)) {
      return value.map(i => this._walkShapeAndGetValues(i));
    }
    if (value instanceof Animated.Node) {
      return value.__getValue();
    }
    if (typeof value === 'object') {
      const result = {};
      for (const key in value) {
        result[key] = this._walkShapeAndGetValues(value[key]);
      }
      return result;
    }
    return value;
  }

  __getValue() {
    const result = this._walkShapeAndGetValues(this.shape);
    return result;
  }

  _walkAndProcess(value, cb) {
    if (Array.isArray(value)) {
      value.forEach(i => this._walkAndProcess(i, cb));
    } else if (value instanceof Animated.Node) {
      cb(value);
    } else if (typeof value === 'object') {
      for (const key in value) {
        this._walkAndProcess(value[key], cb);
      }
    }
  }

  __attach() {
    this._walkAndProcess(this.shape, v => v.__addChild(this));
  }

  __detach() {
    this._walkAndProcess(this.shape, v => v.__removeChild(this));
    super.__detach();
  }
}

export default AnimatedShape;
