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
  }

  newCoordAnimator(config) {
    const {toValue} = config;
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

  animate(type, config) {
    const {toValue, ...rest} = config;

    if (this.coordAnimator) {
      // there was a started but not finsihed animation
      this.animation.stop();
      this.coordinatesArray = this.coordAnimator.calculateState(
        this.transformToNew.__getValue(),
        this.coordinatesArray,
      );
      this.transformToNew.__removeChild(this);
      this.coordAnimator = null;
      this.transformToNew = null;
      this.animation = null;
    }

    const transformToNew = new Animated.Value(0.0);
    transformToNew.__addChild(this);
    this.transformToNew = transformToNew;
    this.animation = Animated[type](this.transformToNew, {
      ...rest,
      toValue: 1.0,
    });
    this.coordAnimator = this.newCoordAnimator(config);
    return this.animation;
  }

  timing(config) {
    return this.animate('timing', config);
  }

  spring(config) {
    return this.animate('spring', config);
  }

  decay(config) {
    return this.animate('decay', config);
  }

  __getValue() {
    if (!this.coordAnimator) {
      return this.coordinatesArray.map(coord => [coord[0], coord[1]]);
    }
    return this.coordAnimator.calculate(
      this.transformToNew.__getValue(),
      this.coordinatesArray,
    );
  }
}

export default AnimatedCoordinatesArray;
