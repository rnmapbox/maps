export default Animated;
declare namespace Animated {
    export const ShapeSource: RNAnimated.AnimatedComponent<import("react").ComponentType<any>>;
    export const ImageSource: RNAnimated.AnimatedComponent<typeof import("../../components/ImageSource").default>;
    export const FillLayer: RNAnimated.AnimatedComponent<typeof import("../../components/FillLayer").default>;
    export const FillExtrusionLayer: RNAnimated.AnimatedComponent<typeof import("../../components/FillExtrusionLayer").default>;
    export const LineLayer: RNAnimated.AnimatedComponent<typeof import("../../components/LineLayer").default>;
    export const CircleLayer: RNAnimated.AnimatedComponent<typeof import("../../components/CircleLayer").default>;
    export const SymbolLayer: RNAnimated.AnimatedComponent<typeof import("../../components/SymbolLayer").default>;
    export const RasterLayer: RNAnimated.AnimatedComponent<typeof import("../../components/RasterLayer").default>;
    export const BackgroundLayer: RNAnimated.AnimatedComponent<typeof import("../../components/BackgroundLayer").default>;
    export { AnimatedCoordinatesArray as CoordinatesArray };
    export { AnimatedRouteCoordinatesArray as RouteCoordinatesArray };
    export { AnimatedShape as Shape };
    export { AnimatedExtractCoordinateFromArray as ExtractCoordinateFromArray };
}
import { Animated as RNAnimated } from "react-native";
import AnimatedCoordinatesArray from "./AnimatedCoordinatesArray";
import AnimatedRouteCoordinatesArray from "./AnimatedRouteCoordinatesArray";
import AnimatedShape from "./AnimatedShape";
import AnimatedExtractCoordinateFromArray from "./AnimatedExtractCoordinateFromArray";
//# sourceMappingURL=Animated.d.ts.map