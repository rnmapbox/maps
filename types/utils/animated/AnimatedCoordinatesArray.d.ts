export default AnimatedCoordinatesArray;
declare const AnimatedCoordinatesArray_base: any;
declare class AnimatedCoordinatesArray extends AnimatedCoordinatesArray_base {
    [x: string]: any;
    constructor(...args: any[]);
    state: any;
    /**
     * Subclasses can override to calculate initial state
     *
     * @param {*} args - to value from animate
     * @returns {object} - the state object
     */
    onInitialState(coordinatesArray: any): object;
    /**
     * Subclasses can override getValue to calculate value from state.
     * Value is typically coordinates array, but can be anything
     *
     * @param {object} state - either state from initialState and/or from calculate
     * @returns {object}
     */
    onGetValue(state: object): object;
    /**
     * Calculates state based on startingState and progress, returns a new state
     *
     * @param {object} state - state object from initialState and/or from calculate
     * @param {number} progress - value between 0 and 1
     * @returns {object} next state
     */
    onCalculate(state: object, progress: number): object;
    /**
     * Subclasses can override to start a new animation
     *
     * @param {*} toValue - to value from animate
     * @param {*} actCoords - the current coordinates array to start from
     * @returns {object} The state
     */
    onStart(state: any, toValue: any): object;
    animate(progressValue: any, progressAnimation: any, config: any): any;
    progressValue: any;
    animation: any;
    timing(config: any): any;
    spring(config: any): any;
    decay(config: any): any;
    __getValue(): any;
}
//# sourceMappingURL=AnimatedCoordinatesArray.d.ts.map