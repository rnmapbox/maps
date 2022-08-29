export default Style;
/**
 * Style is a component that automatically adds sources / layers to the map using Mapbox GL Style Spec.
 * Only [`sources`](https://docs.mapbox.com/mapbox-gl-js/style-spec/sources) & [`layers`](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/) are supported.
 * Other fields such as `sprites`, `glyphs` etc. will be ignored. Not all layer / source attributes from the style spec are supported, in general the supported attributes will mentioned under https://github.com/rnmapbox/maps/tree/main/docs.
 */
declare function Style(props: any): JSX.Element;
declare namespace Style {
    namespace propTypes {
        const json: PropTypes.Requireable<any>;
    }
}
import PropTypes from "prop-types";
//# sourceMappingURL=Style.d.ts.map