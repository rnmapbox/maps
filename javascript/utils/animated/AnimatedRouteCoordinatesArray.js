import {
  lineString,
  point,
  convertDistance as convertDistanceFn, // eslint-disable-line import/named
  convertLength as convertLengthFn,
} from '@turf/helpers';
import distance from '@turf/distance';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import length from '@turf/length';

import AnimatedCoordinatesArray from './AnimatedCoordinatesArray';

const convertLength = convertLengthFn || convertDistanceFn;

/**
 * AnimatedRoutesCoordinatesArray - animates along route.
 * By default start of route is start, and end of route animated from 100% of route to 0% or route.
 * Eg we have full route to destination and as we're progressing the remaining route gets shorter and shorter.
 */
export default class AnimatedRouteCoordinatesArray extends AnimatedCoordinatesArray {
  /**
   * Calculate initial state
   *
   * @param {*} args - to value from animate
   * @param {} options - options, example 
   * @returns {object} - the state object
   */
  onInitialState(coordinatesArray, options = null) {
    let end = {from :0};
    if (options && options.end) {
      end = options.end;
    }
    return {
      fullRoute: coordinatesArray.map((coord) => [coord[0], coord[1]]),
      end: {from: 0},
    };
  }

  /**
   * Calculate value from state.
   *
   * @param {object} state - either state from initialState and/or from calculate
   * @returns {object}
   */
  onGetValue(state) {
    return state.actRoute || state.fullRoute;
  }

  /**
   * Calculates state based on startingState and progress, returns a new state
   *
   * @param {object} state - state object from initialState and/or from calculate
   * @param {number} progress - value between 0 and 1
   * @returns {object} next state
   */
  onCalculate(state, progress) {
    const {fullRoute, end} = state;
    const currentEnd = end.from * (1.0 - progress) + progress * end.to;

    // console.log("Current end:", end, currentEnd);
    let prevsum = 0;
    let actsum = 0;
    let i = fullRoute.length - 1;
    while (actsum < currentEnd && i > 0) {
      prevsum = actsum;
      actsum += distance(
        point(fullRoute[i]),
        point(fullRoute[i - 1]),
        this.distconf,
      );
      i -= 1;
    }
    if (actsum <= currentEnd) {
      const actRoute = [...fullRoute.slice(0, i + 1)];
      return {fullRoute, end: {...end, current: currentEnd}, actRoute};
    }
    const r = (currentEnd - prevsum) / (actsum - prevsum);
    const or = 1.0 - r;

    // console.log("i", i+1);
    const actRoute = [
      ...fullRoute.slice(0, i + 1),
      [
        fullRoute[i][0] * r + fullRoute[i + 1][0] * or,
        fullRoute[i][1] * r + fullRoute[i + 1][1] * or,
      ],
    ];
    return {fullRoute, end: {...end, current: currentEnd}, actRoute};
  }

  /**
   * Subclasses can override to start a new animation
   *
   * @param {*} toValue - to value from animate
   * @param {*} actCoords - the current coordinates array to start from
   * @returns {object} The state
   */
  onStart(state, toValue) {
    const {fullRoute, end} = state;
    console.log("END", end, "STATE", state, "TO", toValue);
    let toDist;
    if (!toValue.end) {
      console.error(
        'RouteCoordinatesArray: toValue should have end with either along or point',
      );
    }
    if (toValue.end.along != null) {
      const {units} = toValue;
      const ls = lineString(fullRoute);
      toDist = convertLength(toValue.end.along, units);
      toDist = length(ls) - toDist;
    }
    if (toDist != null) {
      if (toValue.end.point) {
        console.warn(
          'RouteCoordinatesArray: toValue.end: has both along and point, point is ignored',
        );
      }
    } else if (toValue.end.point) {
      const ls = lineString(fullRoute);

      const nearest = nearestPointOnLine(ls, toValue.end.point);
      toDist = length(ls) - nearest.properties.location;
    } else {
      console.warn(
        'RouteCoordinatesArray: toValue.end: should have either along or point',
      );
    }

    const result = {
      fullRoute,
      end: {
        ...end,
        from: end.current != null ? end.current : end.from,
        to: toDist,
      },
    };
    console.log("RET:", result);
    return result;
  }

  get originalRoute() {
    return this.state.fullRoute;
  }
}
