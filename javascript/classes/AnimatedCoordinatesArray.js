import { Animated } from 'react-native';

// see
// https://github.com/facebook/react-native/blob/master/Libraries/Animated/src/nodes/AnimatedWithChildren.js
const AnimatedWithChildren = Object.getPrototypeOf(Animated.ValueXY);
if (__DEV__) {
  if (AnimatedWithChildren.name !== 'AnimatedWithChildren') {
    console.error(
      'AnimatedCoordinatesArray could not obtain AnimatedWithChildren base class',
    );
  }
}

const defaultConfig = {
  useNativeDriver: false,
};

export class AnimatedCoordinatesArray extends AnimatedWithChildren {
  constructor(...args) {
    super();

    this.state = this.onInitialState(...args);
  }

  /**
   * Subclasses can override to calculate initial state
   *
   * @param {*} args - to value from animate
   * @returns {object} - the state object
   */
  onInitialState(coordinatesArray) {
    return { coords: coordinatesArray.map((coord) => [coord[0], coord[1]]) };
  }

  /**
   * Subclasses can override getValue to calculate value from state.
   * Value is typically coordinates array, but can be anything
   *
   * @param {object} state - either state from initialState and/or from calculate
   * @returns {object}
   */
  onGetValue(state) {
    return state.coords;
  }

  /**
   * Calculates state based on startingState and progress, returns a new state
   *
   * @param {object} state - state object from initialState and/or from calculate
   * @param {number} progress - value between 0 and 1
   * @returns {object} next state
   */
  onCalculate(state, progress) {
    const { coords, targetCoords } = state;
    const newF = progress;
    const origF = 1.0 - newF;

    // common
    const commonLen = Math.min(coords.length, targetCoords.length);
    const common = coords
      .slice(0, commonLen)
      .map((origCoord, i) => [
        origCoord[0] * origF + targetCoords[i][0] * newF,
        origCoord[1] * origF + targetCoords[i][1] * newF,
      ]);

    if (targetCoords.length > coords.length) {
      // only in new (adding)
      const addingOrig =
        coords.length > 0 ? coords[coords.length - 1] : targetCoords[0];
      const adding = targetCoords
        .slice(commonLen, targetCoords.length)
        .map((newCoord) => [
          addingOrig[0] * origF + newCoord[0] * newF,
          addingOrig[1] * origF + newCoord[1] * newF,
        ]);
      return { coords: [...common, ...adding], targetCoords };
    }

    if (coords.length > targetCoords.length) {
      // only in orig (dissapearing)
      const dissapearingNew =
        targetCoords.length > 0
          ? targetCoords[targetCoords.length - 1]
          : coords[0];
      const dissapearing = coords
        .slice(commonLen, coords.length)
        .map((origCoord) => [
          origCoord[0] * origF + dissapearingNew[0] * newF,
          origCoord[1] * origF + dissapearingNew[1] * newF,
        ]);
      return { coords: [...common, ...dissapearing], targetCoords };
    }

    return { coords: common, targetCoords };
  }

  /**
   * Subclasses can override to start a new animation
   *
   * @param {*} toValue - to value from animate
   * @param {*} actCoords - the current coordinates array to start from
   * @returns {object} The state
   */
  onStart(state, toValue) {
    const targetCoords = toValue.map((coord) => [coord[0], coord[1]]);
    return {
      ...state,
      targetCoords,
    };
  }

  animate(progressValue, progressAnimation, config) {
    const { toValue } = config;

    const onAnimationStart = (animation) => {
      if (this.animation) {
        // there was a started but not finsihed animation
        const actProgress = this.progressValue.__getValue();
        this.animation.stop();
        this.state = this.onCalculate(this.state, actProgress);
        this.progressValue.__removeChild(this);
        this.progressValue = null;
        this.animation = null;
      }

      this.progressValue = progressValue;
      this.progressValue.__addChild(this);
      this.animation = animation;
      this.state = this.onStart(this.state, toValue);
    };

    const origAnimationStart = progressAnimation.start;
    const newAnimation = progressAnimation;
    newAnimation.start = function start(...args) {
      onAnimationStart(progressAnimation);
      origAnimationStart(...args);
    };
    return newAnimation;
  }

  timing(config) {
    const progressValue = new Animated.Value(0.0);
    return this.animate(
      progressValue,
      Animated.timing(progressValue, {
        ...defaultConfig,
        ...config,
        toValue: 1.0,
      }),
      config,
    );
  }

  spring(config) {
    const progressValue = new Animated.Value(0.0);
    return this.animate(
      progressValue,
      Animated.spring(progressValue, {
        ...defaultConfig,
        ...config,
        toValue: 1.0,
      }),
      config,
    );
  }

  decay(config) {
    const progressValue = new Animated.Value(0.0);
    return this.animate(
      progressValue,
      Animated.decay(this.progressValue, {
        ...defaultConfig,
        ...config,
        toValue: 1.0,
      }),
      config,
    );
  }

  __getValue() {
    if (!this.progressValue) {
      return this.onGetValue(this.state);
    }
    return this.onGetValue(
      this.onCalculate(this.state, this.progressValue.__getValue()),
    );
  }
}

export default AnimatedCoordinatesArray;
