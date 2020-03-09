import {Animated} from 'react-native';

/* eslint-disable guard-for-in */

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

class AnimatedCoordinatesArray extends AnimatedWithChildren {
  constructor(coordinatesArray) {
    super();

    this.coordinatesArray = coordinatesArray.map(coord => [...coord]);

    // progressValue is a 0->1 value describing the animation
    this.progressValue = new Animated.Value(0.0);
    this.progressValue.__addChild(this);
  }

  /**
   * @typedef {Object} CoordinatesAnimator
   *
   * @property {function} calculate - Calculate new coordinates based on progres: a nubmer
   *   between 0-1 specifying where the animation is, and origCoords the starting coordinates.
   */


  /**
   * Subclasses can override to implement different animations.
   *
   * @param {*} toValue - to value from animate
   * @param {*} actCoords - the current coordinates array to start from
   * @returns {CoordinatesAnimator}
   */
  createCoordinatesAnimator(toValue, actCoords) {
    const newCoords = toValue.map(coord => [...coord]);
    return {
      coords: newCoords,
      calculate(progress, origCoords) {
        const newF = progress;
        const origF = 1.0 - newF;
        const nextCoords = this.coords;

        // common
        const commonLen = Math.min(origCoords.length, newCoords.length);
        const common = origCoords
          .slice(0, commonLen)
          .map((origCoord, i) => [
            origCoord[0] * origF + newCoords[i][0] * newF,
            origCoord[1] * origF + newCoords[i][1] * newF,
          ]);

        if (nextCoords.length > origCoords.length) {
          // only in new (adding)
          const addingOrig =
            origCoords.length > 0
              ? origCoords[origCoords.length - 1]
              : nextCoords[0];
          const adding = nextCoords
            .slice(commonLen, nextCoords.length)
            .map(newCoord => [
              addingOrig[0] * origF + newCoord[0] * newF,
              addingOrig[1] * origF + newCoord[1] * newF,
            ]);
          return [...common, ...adding];
        }

        if (origCoords.length > nextCoords.length) {
          // only in orig (dissapearing)
          const dissapearingNew =
            nextCoords.length > 0
              ? nextCoords[nextCoords.length - 1]
              : origCoords[0];
          const dissapearing = origCoords
            .slice(commonLen, origCoords.length)
            .map(origCoord => [
              origCoord[0] * origF + dissapearingNew[0] * newF,
              origCoord[1] * origF + dissapearingNew[1] * newF,
            ]);
          return [...common, ...dissapearing];
        }

        return common;
      },
    };
  }

  animate(progressAnimation, config) {
    const {toValue} = config;

    const onAnimationStart = animation => {
      if (this.coordAnimator) {
        // there was a started but not finsihed animation
        const actProgress = this.progressValue.__getValue();
        this.animation.stop();
        this.progressValue.setValue(0.0);
        this.coordinatesArray = this.coordAnimator.calculate(
          actProgress,
          this.coordinatesArray,
        );
        this.coordAnimator = null;
        this.animation = null;
      }

      this.animation = animation;
      this.coordAnimator = this.createCoordinatesAnimator(
        toValue,
        this.coordinatesArray,
      );
    };

    const origAnimationStart = progressAnimation.start;
    const newAnimation = progressAnimation;
    newAnimation.start = function start(...args) {
      onAnimationStart(progressAnimation);
      origAnimationStart(...args);
    }
    return newAnimation;
  }

  timing(config) {
    return this.animate(
      Animated.timing(this.progressValue, {...config, toValue: 1.0}),
      config,
    );
  }

  spring(config) {
    return this.animate(
      Animated.spring(this.progressValue, {...config, toValue: 1.0}),
      config,
    );
  }

  decay(config) {
    return this.animate(
      Animated.decay(this.progressValue, {...config, toValue: 1.0}),
      config,
    );
  }

  __getValue() {
    if (!this.coordAnimator) {
      return this.coordinatesArray.map(coord => [coord[0], coord[1]]);
    }
    return this.coordAnimator.calculate(
      this.progressValue.__getValue(),
      this.coordinatesArray,
    );
  }
}

export default AnimatedCoordinatesArray;
