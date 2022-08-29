declare const AnimatedPoint_base: any;
export class AnimatedPoint extends AnimatedPoint_base {
    [x: string]: any;
    constructor(point?: {
        type: string;
        coordinates: number[];
    });
    longitude: Animated.Value;
    latitude: Animated.Value;
    _listeners: {};
    setValue(point?: {
        type: string;
        coordinates: number[];
    }): void;
    setOffset(point?: {
        type: string;
        coordinates: number[];
    }): void;
    flattenOffset(): void;
    stopAnimation(cb: any): void;
    addListener(cb: any): string;
    removeListener(id: any): void;
    spring(config?: {
        coordinates: number[];
    }): Animated.CompositeAnimation;
    timing(config?: {
        coordinates: number[];
    }): Animated.CompositeAnimation;
    __getValue(): {
        type: string;
        coordinates: any[];
    };
    __attach(): void;
    __detach(): void;
}
export default AnimatedPoint;
import { Animated } from "react-native";
//# sourceMappingURL=AnimatedPoint.d.ts.map