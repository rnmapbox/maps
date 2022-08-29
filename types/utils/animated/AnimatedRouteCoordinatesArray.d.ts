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
    onInitialState(coordinatesArray: any, options?: any): object;
    get originalRoute(): any;
}
import AnimatedCoordinatesArray from "./AnimatedCoordinatesArray";
//# sourceMappingURL=AnimatedRouteCoordinatesArray.d.ts.map