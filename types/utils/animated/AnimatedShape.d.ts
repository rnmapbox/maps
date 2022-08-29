export default AnimatedShape;
declare const AnimatedShape_base: any;
/**
 * AnimatedShape can be used to have animated properties inside the shape property
 * @example
 * <AnimatedShapeSource ... shape={new AnimatedShape({type:'LineString', coordinates: animatedCoords})} />
 */
declare class AnimatedShape extends AnimatedShape_base {
    [x: string]: any;
    constructor(shape: any);
    shape: any;
    _walkShapeAndGetValues(value: any): any;
    __getValue(): any;
    _walkAndProcess(value: any, cb: any): void;
    __attach(): void;
    __detach(): void;
}
//# sourceMappingURL=AnimatedShape.d.ts.map