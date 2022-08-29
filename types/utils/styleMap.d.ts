import PropTypes from 'prop-types';
export declare const StyleTypes: {
    Constant: string;
    Color: string;
    Transition: string;
    Translation: string;
    Function: string;
    Image: string;
    Enum: string;
};
export declare function getStyleType(styleProp: keyof typeof styleExtras): string;
export declare const FillLayerStyleProp: PropTypes.Requireable<PropTypes.InferProps<{
    /**
     * Sorts features in ascending order based on this value. Features with a higher sort key will appear above features with a lower sort key.
     */
    fillSortKey: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Whether this layer is displayed.
     */
    visibility: PropTypes.Requireable<string>;
    /**
     * Whether or not the fill should be antialiased.
     */
    fillAntialias: PropTypes.Requireable<NonNullable<boolean | any[] | null | undefined>>;
    /**
     * The opacity of the entire fill layer. In contrast to the `fillColor`, this value will also affect the 1px stroke around the fill, if the stroke is used.
     */
    fillOpacity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s fillOpacity property.
     */
    fillOpacityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The color of the filled part of this layer. This color can be specified as `rgba` with an alpha component and the color's opacity will not affect the opacity of the 1px stroke, if it is used.
     *
     * @disabledBy fillPattern
     */
    fillColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s fillColor property.
     */
    fillColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The outline color of the fill. Matches the value of `fillColor` if unspecified.
     *
     * @disabledBy fillPattern
     */
    fillOutlineColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s fillOutlineColor property.
     */
    fillOutlineColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively.
     */
    fillTranslate: PropTypes.Requireable<any[]>;
    /**
     * The transition affecting any changes to this layer’s fillTranslate property.
     */
    fillTranslateTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Controls the frame of reference for `fillTranslate`.
     *
     * @requires fillTranslate
     */
    fillTranslateAnchor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Name of image in sprite to use for drawing image fills. For seamless patterns, image width and height must be a factor of two (2, 4, 8, ..., 512). Note that zoomDependent expressions will be evaluated only at integer zoom levels.
     */
    fillPattern: PropTypes.Requireable<NonNullable<string | number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s fillPattern property.
     */
    fillPatternTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
}>>;
export declare const LineLayerStyleProp: PropTypes.Requireable<PropTypes.InferProps<{
    /**
     * The display of line endings.
     */
    lineCap: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The display of lines when joining.
     */
    lineJoin: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Used to automatically convert miter joins to bevel joins for sharp angles.
     */
    lineMiterLimit: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Used to automatically convert round joins to miter joins for shallow angles.
     */
    lineRoundLimit: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Sorts features in ascending order based on this value. Features with a higher sort key will appear above features with a lower sort key.
     */
    lineSortKey: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Whether this layer is displayed.
     */
    visibility: PropTypes.Requireable<string>;
    /**
     * The opacity at which the line will be drawn.
     */
    lineOpacity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s lineOpacity property.
     */
    lineOpacityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The color with which the line will be drawn.
     *
     * @disabledBy linePattern
     */
    lineColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s lineColor property.
     */
    lineColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively.
     */
    lineTranslate: PropTypes.Requireable<any[]>;
    /**
     * The transition affecting any changes to this layer’s lineTranslate property.
     */
    lineTranslateTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Controls the frame of reference for `lineTranslate`.
     *
     * @requires lineTranslate
     */
    lineTranslateAnchor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Stroke thickness.
     */
    lineWidth: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s lineWidth property.
     */
    lineWidthTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Draws a line casing outside of a line's actual path. Value indicates the width of the inner gap.
     */
    lineGapWidth: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s lineGapWidth property.
     */
    lineGapWidthTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The line's offset. For linear features, a positive value offsets the line to the right, relative to the direction of the line, and a negative value to the left. For polygon features, a positive value results in an inset, and a negative value results in an outset.
     */
    lineOffset: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s lineOffset property.
     */
    lineOffsetTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Blur applied to the line, in pixels.
     */
    lineBlur: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s lineBlur property.
     */
    lineBlurTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Specifies the lengths of the alternating dashes and gaps that form the dash pattern. The lengths are later scaled by the line width. To convert a dash length to pixels, multiply the length by the current line width. Note that GeoJSON sources with `lineMetrics: true` specified won't render dashed lines to the expected scale. Also note that zoomDependent expressions will be evaluated only at integer zoom levels.
     *
     * @disabledBy linePattern
     */
    lineDasharray: PropTypes.Requireable<any[]>;
    /**
     * The transition affecting any changes to this layer’s lineDasharray property.
     */
    lineDasharrayTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Name of image in sprite to use for drawing image lines. For seamless patterns, image width must be a factor of two (2, 4, 8, ..., 512). Note that zoomDependent expressions will be evaluated only at integer zoom levels.
     */
    linePattern: PropTypes.Requireable<NonNullable<string | number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s linePattern property.
     */
    linePatternTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Defines a gradient with which to color a line feature. Can only be used with GeoJSON sources that specify `"lineMetrics": true`.
     *
     * @disabledBy linePattern
     */
    lineGradient: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The line part between [trimStart, trimEnd] will be marked as transparent to make a route vanishing effect. The line trimOff offset is based on the whole line range [0.0, 1.0].
     */
    lineTrimOffset: PropTypes.Requireable<(number | null | undefined)[]>;
}>>;
export declare const SymbolLayerStyleProp: PropTypes.Requireable<PropTypes.InferProps<{
    /**
     * Label placement relative to its geometry.
     */
    symbolPlacement: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Distance between two symbol anchors.
     */
    symbolSpacing: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * If true, the symbols will not cross tile edges to avoid mutual collisions. Recommended in layers that don't have enough padding in the vector tile to prevent collisions, or if it is a point symbol layer placed after a line symbol layer. When using a client that supports global collision detection, like Mapbox GL JS version 0.42.0 or greater, enabling this property is not needed to prevent clipped labels at tile boundaries.
     */
    symbolAvoidEdges: PropTypes.Requireable<NonNullable<boolean | any[] | null | undefined>>;
    /**
     * Sorts features in ascending order based on this value. Features with lower sort keys are drawn and placed first.  When `iconAllowOverlap` or `textAllowOverlap` is `false`, features with a lower sort key will have priority during placement. When `iconAllowOverlap` or `textAllowOverlap` is set to `true`, features with a higher sort key will overlap over features with a lower sort key.
     */
    symbolSortKey: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Determines whether overlapping symbols in the same layer are rendered in the order that they appear in the data source or by their yPosition relative to the viewport. To control the order and prioritization of symbols otherwise, use `symbolSortKey`.
     */
    symbolZOrder: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * If true, the icon will be visible even if it collides with other previously drawn symbols.
     *
     * @requires iconImage
     */
    iconAllowOverlap: PropTypes.Requireable<NonNullable<boolean | any[] | null | undefined>>;
    /**
     * If true, other symbols can be visible even if they collide with the icon.
     *
     * @requires iconImage
     */
    iconIgnorePlacement: PropTypes.Requireable<NonNullable<boolean | any[] | null | undefined>>;
    /**
     * If true, text will display without their corresponding icons when the icon collides with other symbols and the text does not.
     *
     * @requires iconImage, textField
     */
    iconOptional: PropTypes.Requireable<NonNullable<boolean | any[] | null | undefined>>;
    /**
     * In combination with `symbolPlacement`, determines the rotation behavior of icons.
     *
     * @requires iconImage
     */
    iconRotationAlignment: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Scales the original size of the icon by the provided factor. The new pixel size of the image will be the original pixel size multiplied by `iconSize`. 1 is the original size; 3 triples the size of the image.
     *
     * @requires iconImage
     */
    iconSize: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Scales the icon to fit around the associated text.
     *
     * @requires iconImage, textField
     */
    iconTextFit: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Size of the additional area added to dimensions determined by `iconTextFit`, in clockwise order: top, right, bottom, left.
     *
     * @requires iconImage, textField
     */
    iconTextFitPadding: PropTypes.Requireable<any[]>;
    /**
     * Name of image in sprite to use for drawing an image background.
     */
    iconImage: PropTypes.Requireable<NonNullable<string | number | any[] | null | undefined>>;
    /**
     * Rotates the icon clockwise.
     *
     * @requires iconImage
     */
    iconRotate: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Size of the additional area around the icon bounding box used for detecting symbol collisions.
     *
     * @requires iconImage
     */
    iconPadding: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * If true, the icon may be flipped to prevent it from being rendered upsideDown.
     *
     * @requires iconImage
     */
    iconKeepUpright: PropTypes.Requireable<NonNullable<boolean | any[] | null | undefined>>;
    /**
     * Offset distance of icon from its anchor. Positive values indicate right and down, while negative values indicate left and up. Each component is multiplied by the value of `iconSize` to obtain the final offset in pixels. When combined with `iconRotate` the offset will be as if the rotated direction was up.
     *
     * @requires iconImage
     */
    iconOffset: PropTypes.Requireable<any[]>;
    /**
     * Part of the icon placed closest to the anchor.
     *
     * @requires iconImage
     */
    iconAnchor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Orientation of icon when map is pitched.
     *
     * @requires iconImage
     */
    iconPitchAlignment: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Orientation of text when map is pitched.
     *
     * @requires textField
     */
    textPitchAlignment: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * In combination with `symbolPlacement`, determines the rotation behavior of the individual glyphs forming the text.
     *
     * @requires textField
     */
    textRotationAlignment: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Value to use for a text label. If a plain `string` is provided, it will be treated as a `formatted` with default/inherited formatting options. SDF images are not supported in formatted text and will be ignored.
     */
    textField: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Font stack to use for displaying text.
     *
     * @requires textField
     */
    textFont: PropTypes.Requireable<any[]>;
    /**
     * Font size.
     *
     * @requires textField
     */
    textSize: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The maximum line width for text wrapping.
     *
     * @requires textField
     */
    textMaxWidth: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Text leading value for multiLine text.
     *
     * @requires textField
     */
    textLineHeight: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Text tracking amount.
     *
     * @requires textField
     */
    textLetterSpacing: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Text justification options.
     *
     * @requires textField
     */
    textJustify: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Radial offset of text, in the direction of the symbol's anchor. Useful in combination with `textVariableAnchor`, which defaults to using the twoDimensional `textOffset` if present.
     *
     * @requires textField
     */
    textRadialOffset: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * To increase the chance of placing highPriority labels on the map, you can provide an array of `textAnchor` locations: the renderer will attempt to place the label at each location, in order, before moving onto the next label. Use `textJustify: auto` to choose justification based on anchor position. To apply an offset, use the `textRadialOffset` or the twoDimensional `textOffset`.
     *
     * @requires textField
     */
    textVariableAnchor: PropTypes.Requireable<any[]>;
    /**
     * Part of the text placed closest to the anchor.
     *
     * @requires textField
     *
     * @disabledBy textVariableAnchor
     */
    textAnchor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Maximum angle change between adjacent characters.
     *
     * @requires textField
     */
    textMaxAngle: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The property allows control over a symbol's orientation. Note that the property values act as a hint, so that a symbol whose language doesn’t support the provided orientation will be laid out in its natural orientation. Example: English point symbol will be rendered horizontally even if array value contains single 'vertical' enum value. For symbol with point placement, the order of elements in an array define priority order for the placement of an orientation variant. For symbol with line placement, the default text writing mode is either ['horizontal', 'vertical'] or ['vertical', 'horizontal'], the order doesn't affect the placement.
     *
     * @requires textField
     */
    textWritingMode: PropTypes.Requireable<any[]>;
    /**
     * Rotates the text clockwise.
     *
     * @requires textField
     */
    textRotate: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Size of the additional area around the text bounding box used for detecting symbol collisions.
     *
     * @requires textField
     */
    textPadding: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * If true, the text may be flipped vertically to prevent it from being rendered upsideDown.
     *
     * @requires textField
     */
    textKeepUpright: PropTypes.Requireable<NonNullable<boolean | any[] | null | undefined>>;
    /**
     * Specifies how to capitalize text, similar to the CSS `textTransform` property.
     *
     * @requires textField
     */
    textTransform: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Offset distance of text from its anchor. Positive values indicate right and down, while negative values indicate left and up. If used with textVariableAnchor, input values will be taken as absolute values. Offsets along the x and yAxis will be applied automatically based on the anchor position.
     *
     * @requires textField
     *
     * @disabledBy textRadialOffset
     */
    textOffset: PropTypes.Requireable<any[]>;
    /**
     * If true, the text will be visible even if it collides with other previously drawn symbols.
     *
     * @requires textField
     */
    textAllowOverlap: PropTypes.Requireable<NonNullable<boolean | any[] | null | undefined>>;
    /**
     * If true, other symbols can be visible even if they collide with the text.
     *
     * @requires textField
     */
    textIgnorePlacement: PropTypes.Requireable<NonNullable<boolean | any[] | null | undefined>>;
    /**
     * If true, icons will display without their corresponding text when the text collides with other symbols and the icon does not.
     *
     * @requires textField, iconImage
     */
    textOptional: PropTypes.Requireable<NonNullable<boolean | any[] | null | undefined>>;
    /**
     * Whether this layer is displayed.
     */
    visibility: PropTypes.Requireable<string>;
    /**
     * The opacity at which the icon will be drawn.
     *
     * @requires iconImage
     */
    iconOpacity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s iconOpacity property.
     */
    iconOpacityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The color of the icon. This can only be used with [SDF icons](/help/troubleshooting/usingRecolorableImagesInMapboxMaps/).
     *
     * @requires iconImage
     */
    iconColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s iconColor property.
     */
    iconColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The color of the icon's halo. Icon halos can only be used with [SDF icons](/help/troubleshooting/usingRecolorableImagesInMapboxMaps/).
     *
     * @requires iconImage
     */
    iconHaloColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s iconHaloColor property.
     */
    iconHaloColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Distance of halo to the icon outline.
     *
     * @requires iconImage
     */
    iconHaloWidth: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s iconHaloWidth property.
     */
    iconHaloWidthTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Fade out the halo towards the outside.
     *
     * @requires iconImage
     */
    iconHaloBlur: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s iconHaloBlur property.
     */
    iconHaloBlurTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Distance that the icon's anchor is moved from its original placement. Positive values indicate right and down, while negative values indicate left and up.
     *
     * @requires iconImage
     */
    iconTranslate: PropTypes.Requireable<any[]>;
    /**
     * The transition affecting any changes to this layer’s iconTranslate property.
     */
    iconTranslateTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Controls the frame of reference for `iconTranslate`.
     *
     * @requires iconImage, iconTranslate
     */
    iconTranslateAnchor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The opacity at which the text will be drawn.
     *
     * @requires textField
     */
    textOpacity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s textOpacity property.
     */
    textOpacityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The color with which the text will be drawn.
     *
     * @requires textField
     */
    textColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s textColor property.
     */
    textColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The color of the text's halo, which helps it stand out from backgrounds.
     *
     * @requires textField
     */
    textHaloColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s textHaloColor property.
     */
    textHaloColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Distance of halo to the font outline. Max text halo width is 1/4 of the fontSize.
     *
     * @requires textField
     */
    textHaloWidth: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s textHaloWidth property.
     */
    textHaloWidthTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The halo's fadeout distance towards the outside.
     *
     * @requires textField
     */
    textHaloBlur: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s textHaloBlur property.
     */
    textHaloBlurTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Distance that the text's anchor is moved from its original placement. Positive values indicate right and down, while negative values indicate left and up.
     *
     * @requires textField
     */
    textTranslate: PropTypes.Requireable<any[]>;
    /**
     * The transition affecting any changes to this layer’s textTranslate property.
     */
    textTranslateTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Controls the frame of reference for `textTranslate`.
     *
     * @requires textField, textTranslate
     */
    textTranslateAnchor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
}>>;
export declare const CircleLayerStyleProp: PropTypes.Requireable<PropTypes.InferProps<{
    /**
     * Sorts features in ascending order based on this value. Features with a higher sort key will appear above features with a lower sort key.
     */
    circleSortKey: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Whether this layer is displayed.
     */
    visibility: PropTypes.Requireable<string>;
    /**
     * Circle radius.
     */
    circleRadius: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s circleRadius property.
     */
    circleRadiusTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The fill color of the circle.
     */
    circleColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s circleColor property.
     */
    circleColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Amount to blur the circle. 1 blurs the circle such that only the centerpoint is full opacity.
     */
    circleBlur: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s circleBlur property.
     */
    circleBlurTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The opacity at which the circle will be drawn.
     */
    circleOpacity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s circleOpacity property.
     */
    circleOpacityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively.
     */
    circleTranslate: PropTypes.Requireable<any[]>;
    /**
     * The transition affecting any changes to this layer’s circleTranslate property.
     */
    circleTranslateTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Controls the frame of reference for `circleTranslate`.
     *
     * @requires circleTranslate
     */
    circleTranslateAnchor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Controls the scaling behavior of the circle when the map is pitched.
     */
    circlePitchScale: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Orientation of circle when map is pitched.
     */
    circlePitchAlignment: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The width of the circle's stroke. Strokes are placed outside of the `circleRadius`.
     */
    circleStrokeWidth: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s circleStrokeWidth property.
     */
    circleStrokeWidthTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The stroke color of the circle.
     */
    circleStrokeColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s circleStrokeColor property.
     */
    circleStrokeColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The opacity of the circle's stroke.
     */
    circleStrokeOpacity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s circleStrokeOpacity property.
     */
    circleStrokeOpacityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
}>>;
export declare const HeatmapLayerStyleProp: PropTypes.Requireable<PropTypes.InferProps<{
    /**
     * Whether this layer is displayed.
     */
    visibility: PropTypes.Requireable<string>;
    /**
     * Radius of influence of one heatmap point in pixels. Increasing the value makes the heatmap smoother, but less detailed. `queryRenderedFeatures` on heatmap layers will return points within this radius.
     */
    heatmapRadius: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s heatmapRadius property.
     */
    heatmapRadiusTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * A measure of how much an individual point contributes to the heatmap. A value of 10 would be equivalent to having 10 points of weight 1 in the same spot. Especially useful when combined with clustering.
     */
    heatmapWeight: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Similar to `heatmapWeight` but controls the intensity of the heatmap globally. Primarily used for adjusting the heatmap based on zoom level.
     */
    heatmapIntensity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s heatmapIntensity property.
     */
    heatmapIntensityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Defines the color of each pixel based on its density value in a heatmap.  Should be an expression that uses `["heatmapDensity"]` as input.
     */
    heatmapColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The global opacity at which the heatmap layer will be drawn.
     */
    heatmapOpacity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s heatmapOpacity property.
     */
    heatmapOpacityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
}>>;
export declare const FillExtrusionLayerStyleProp: PropTypes.Requireable<PropTypes.InferProps<{
    /**
     * Whether this layer is displayed.
     */
    visibility: PropTypes.Requireable<string>;
    /**
     * The opacity of the entire fill extrusion layer. This is rendered on a perLayer, not perFeature, basis, and dataDriven styling is not available.
     */
    fillExtrusionOpacity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s fillExtrusionOpacity property.
     */
    fillExtrusionOpacityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The base color of the extruded fill. The extrusion's surfaces will be shaded differently based on this color in combination with the root `light` settings. If this color is specified as `rgba` with an alpha component, the alpha component will be ignored; use `fillExtrusionOpacity` to set layer opacity.
     *
     * @disabledBy fillExtrusionPattern
     */
    fillExtrusionColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s fillExtrusionColor property.
     */
    fillExtrusionColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The geometry's offset. Values are [x, y] where negatives indicate left and up (on the flat plane), respectively.
     */
    fillExtrusionTranslate: PropTypes.Requireable<any[]>;
    /**
     * The transition affecting any changes to this layer’s fillExtrusionTranslate property.
     */
    fillExtrusionTranslateTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Controls the frame of reference for `fillExtrusionTranslate`.
     *
     * @requires fillExtrusionTranslate
     */
    fillExtrusionTranslateAnchor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Name of image in sprite to use for drawing images on extruded fills. For seamless patterns, image width and height must be a factor of two (2, 4, 8, ..., 512). Note that zoomDependent expressions will be evaluated only at integer zoom levels.
     */
    fillExtrusionPattern: PropTypes.Requireable<NonNullable<string | number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s fillExtrusionPattern property.
     */
    fillExtrusionPatternTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The height with which to extrude this layer.
     */
    fillExtrusionHeight: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s fillExtrusionHeight property.
     */
    fillExtrusionHeightTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The height with which to extrude the base of this layer. Must be less than or equal to `fillExtrusionHeight`.
     *
     * @requires fillExtrusionHeight
     */
    fillExtrusionBase: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s fillExtrusionBase property.
     */
    fillExtrusionBaseTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Whether to apply a vertical gradient to the sides of a fillExtrusion layer. If true, sides will be shaded slightly darker farther down.
     */
    fillExtrusionVerticalGradient: PropTypes.Requireable<NonNullable<boolean | any[] | null | undefined>>;
    /**
     * Controls the intensity of ambient occlusion (AO) shading. Current AO implementation is a lowCost bestEffort approach that shades area near ground and concave angles between walls. Default value 0.0 disables ambient occlusion and values around 0.3 provide the most plausible results for buildings.
     */
    fillExtrusionAmbientOcclusionIntensity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s fillExtrusionAmbientOcclusionIntensity property.
     */
    fillExtrusionAmbientOcclusionIntensityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The radius of ambient occlusion (AO) shading, in meters. Current AO implementation is a lowCost bestEffort approach that shades area near ground and concave angles between walls where the radius defines only vertical impact. Default value 3.0 corresponds to hight of one floor and brings the most plausible results for buildings.
     */
    fillExtrusionAmbientOcclusionRadius: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s fillExtrusionAmbientOcclusionRadius property.
     */
    fillExtrusionAmbientOcclusionRadiusTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
}>>;
export declare const RasterLayerStyleProp: PropTypes.Requireable<PropTypes.InferProps<{
    /**
     * Whether this layer is displayed.
     */
    visibility: PropTypes.Requireable<string>;
    /**
     * The opacity at which the image will be drawn.
     */
    rasterOpacity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s rasterOpacity property.
     */
    rasterOpacityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Rotates hues around the color wheel.
     */
    rasterHueRotate: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s rasterHueRotate property.
     */
    rasterHueRotateTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Increase or reduce the brightness of the image. The value is the minimum brightness.
     */
    rasterBrightnessMin: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s rasterBrightnessMin property.
     */
    rasterBrightnessMinTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Increase or reduce the brightness of the image. The value is the maximum brightness.
     */
    rasterBrightnessMax: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s rasterBrightnessMax property.
     */
    rasterBrightnessMaxTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Increase or reduce the saturation of the image.
     */
    rasterSaturation: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s rasterSaturation property.
     */
    rasterSaturationTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Increase or reduce the contrast of the image.
     */
    rasterContrast: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s rasterContrast property.
     */
    rasterContrastTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The resampling/interpolation method to use for overscaling, also known as texture magnification filter
     */
    rasterResampling: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Fade duration when a new tile is added.
     */
    rasterFadeDuration: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
}>>;
export declare const HillshadeLayerStyleProp: PropTypes.Requireable<PropTypes.InferProps<{
    /**
     * Whether this layer is displayed.
     */
    visibility: PropTypes.Requireable<string>;
    /**
     * The direction of the light source used to generate the hillshading with 0 as the top of the viewport if `hillshadeIlluminationAnchor` is set to `viewport` and due north if `hillshadeIlluminationAnchor` is set to `map`.
     */
    hillshadeIlluminationDirection: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Direction of light source when map is rotated.
     */
    hillshadeIlluminationAnchor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Intensity of the hillshade
     */
    hillshadeExaggeration: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s hillshadeExaggeration property.
     */
    hillshadeExaggerationTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The shading color of areas that face away from the light source.
     */
    hillshadeShadowColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s hillshadeShadowColor property.
     */
    hillshadeShadowColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The shading color of areas that faces towards the light source.
     */
    hillshadeHighlightColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s hillshadeHighlightColor property.
     */
    hillshadeHighlightColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The shading color used to accentuate rugged terrain like sharp cliffs and gorges.
     */
    hillshadeAccentColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s hillshadeAccentColor property.
     */
    hillshadeAccentColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
}>>;
export declare const BackgroundLayerStyleProp: PropTypes.Requireable<PropTypes.InferProps<{
    /**
     * Whether this layer is displayed.
     */
    visibility: PropTypes.Requireable<string>;
    /**
     * The color with which the background will be drawn.
     *
     * @disabledBy backgroundPattern
     */
    backgroundColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s backgroundColor property.
     */
    backgroundColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Name of image in sprite to use for drawing an image background. For seamless patterns, image width and height must be a factor of two (2, 4, 8, ..., 512). Note that zoomDependent expressions will be evaluated only at integer zoom levels.
     */
    backgroundPattern: PropTypes.Requireable<NonNullable<string | number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s backgroundPattern property.
     */
    backgroundPatternTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The opacity at which the background will be drawn.
     */
    backgroundOpacity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s backgroundOpacity property.
     */
    backgroundOpacityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
}>>;
export declare const SkyLayerStyleProp: PropTypes.Requireable<PropTypes.InferProps<{
    /**
     * Whether this layer is displayed.
     */
    visibility: PropTypes.Requireable<string>;
    /**
     * The type of the sky
     */
    skyType: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Position of the sun center [a azimuthal angle, p polar angle]. The azimuthal angle indicates the position of the sun relative to 0° north, where degrees proceed clockwise. The polar angle indicates the height of the sun, where 0° is directly above, at zenith, and 90° at the horizon. When this property is ommitted, the sun center is directly inherited from the light position.
     */
    skyAtmosphereSun: PropTypes.Requireable<any[]>;
    /**
     * Intensity of the sun as a light source in the atmosphere (on a scale from 0 to a 100). Setting higher values will brighten up the sky.
     */
    skyAtmosphereSunIntensity: PropTypes.Requireable<number>;
    /**
     * Position of the gradient center [a azimuthal angle, p polar angle]. The azimuthal angle indicates the position of the gradient center relative to 0° north, where degrees proceed clockwise. The polar angle indicates the height of the gradient center, where 0° is directly above, at zenith, and 90° at the horizon.
     */
    skyGradientCenter: PropTypes.Requireable<any[]>;
    /**
     * The angular distance (measured in degrees) from `skyGradientCenter` up to which the gradient extends. A value of 180 causes the gradient to wrap around to the opposite direction from `skyGradientCenter`.
     */
    skyGradientRadius: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * Defines a radial color gradient with which to color the sky. The color values can be interpolated with an expression using `skyRadialProgress`. The range [0, 1] for the interpolant covers a radial distance (in degrees) of [0, `skyGradientRadius`] centered at the position specified by `skyGradientCenter`.
     */
    skyGradient: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * A color applied to the atmosphere sun halo. The alpha channel describes how strongly the sun halo is represented in an atmosphere sky layer.
     */
    skyAtmosphereHaloColor: PropTypes.Requireable<string>;
    /**
     * A color used to tweak the main atmospheric scattering coefficients. Using white applies the default coefficients giving the natural blue color to the atmosphere. This color affects how heavily the corresponding wavelength is represented during scattering. The alpha channel describes the density of the atmosphere, with 1 maximum density and 0 no density.
     */
    skyAtmosphereColor: PropTypes.Requireable<string>;
    /**
     * The opacity of the entire sky layer.
     */
    skyOpacity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s skyOpacity property.
     */
    skyOpacityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
}>>;
export declare const LightLayerStyleProp: PropTypes.Requireable<PropTypes.InferProps<{
    /**
     * Whether extruded geometries are lit relative to the map or viewport.
     */
    anchor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * Position of the light source relative to lit (extruded) geometries, in [r radial coordinate, a azimuthal angle, p polar angle] where r indicates the distance from the center of the base of an object to its light, a indicates the position of the light relative to 0° (0° when `light.anchor` is set to `viewport` corresponds to the top of the viewport, or 0° when `light.anchor` is set to `map` corresponds to due north, and degrees proceed clockwise), and p indicates the height of the light (from 0°, directly above, to 180°, directly below).
     */
    position: PropTypes.Requireable<any[]>;
    /**
     * The transition affecting any changes to this layer’s position property.
     */
    positionTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Color tint for lighting extruded geometries.
     */
    color: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s color property.
     */
    colorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Intensity of lighting (on a scale from 0 to 1). Higher numbers will present as more extreme contrast.
     */
    intensity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s intensity property.
     */
    intensityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
}>>;
export declare const AtmosphereLayerStyleProp: PropTypes.Requireable<PropTypes.InferProps<{
    /**
     * The start and end distance range in which fog fades from fully transparent to fully opaque. The distance to the point at the center of the map is defined as zero, so that negative range values are closer to the camera, and positive values are farther away.
     */
    range: PropTypes.Requireable<any[]>;
    /**
     * The transition affecting any changes to this layer’s range property.
     */
    rangeTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The color of the atmosphere region immediately below the horizon and within the `range` and above the horizon and within `horizonBlend`. Using opacity is recommended only for smoothly transitioning fog on/off as anything less than 100% opacity results in more tiles loaded and drawn.
     */
    color: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s color property.
     */
    colorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The color of the atmosphere region above the horizon, `highColor` extends further above the horizon than the `color` property and its spread can be controlled with `horizonBlend`. The opacity can be set to `0` to remove the high atmosphere color contribution.
     */
    highColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s highColor property.
     */
    highColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * The color of the region above the horizon and after the end of the `horizonBlend` contribution. The opacity can be set to `0` to have a transparent background.
     */
    spaceColor: PropTypes.Requireable<NonNullable<string | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s spaceColor property.
     */
    spaceColorTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * Horizon blend applies a smooth fade from the color of the atmosphere to the color of space. A value of zero leaves a sharp transition from atmosphere to space. Increasing the value blends the color of atmosphere into increasingly high angles of the sky.
     */
    horizonBlend: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s horizonBlend property.
     */
    horizonBlendTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
    /**
     * A value controlling the star intensity where `0` will show no stars and `1` will show stars at their maximum intensity.
     */
    starIntensity: PropTypes.Requireable<NonNullable<number | any[] | null | undefined>>;
    /**
     * The transition affecting any changes to this layer’s starIntensity property.
     */
    starIntensityTransition: PropTypes.Requireable<PropTypes.InferProps<{
        duration: PropTypes.Requireable<number>;
        delay: PropTypes.Requireable<number>;
    }>>;
}>>;
declare const styleMap: {
    fillSortKey: string;
    fillAntialias: string;
    fillOpacity: string;
    fillOpacityTransition: string;
    fillColor: string;
    fillColorTransition: string;
    fillOutlineColor: string;
    fillOutlineColorTransition: string;
    fillTranslate: string;
    fillTranslateTransition: string;
    fillTranslateAnchor: string;
    fillPattern: string;
    fillPatternTransition: string;
    lineCap: string;
    lineJoin: string;
    lineMiterLimit: string;
    lineRoundLimit: string;
    lineSortKey: string;
    lineOpacity: string;
    lineOpacityTransition: string;
    lineColor: string;
    lineColorTransition: string;
    lineTranslate: string;
    lineTranslateTransition: string;
    lineTranslateAnchor: string;
    lineWidth: string;
    lineWidthTransition: string;
    lineGapWidth: string;
    lineGapWidthTransition: string;
    lineOffset: string;
    lineOffsetTransition: string;
    lineBlur: string;
    lineBlurTransition: string;
    lineDasharray: string;
    lineDasharrayTransition: string;
    linePattern: string;
    linePatternTransition: string;
    lineGradient: string;
    lineTrimOffset: string;
    symbolPlacement: string;
    symbolSpacing: string;
    symbolAvoidEdges: string;
    symbolSortKey: string;
    symbolZOrder: string;
    iconAllowOverlap: string;
    iconIgnorePlacement: string;
    iconOptional: string;
    iconRotationAlignment: string;
    iconSize: string;
    iconTextFit: string;
    iconTextFitPadding: string;
    iconImage: string;
    iconRotate: string;
    iconPadding: string;
    iconKeepUpright: string;
    iconOffset: string;
    iconAnchor: string;
    iconPitchAlignment: string;
    textPitchAlignment: string;
    textRotationAlignment: string;
    textField: string;
    textFont: string;
    textSize: string;
    textMaxWidth: string;
    textLineHeight: string;
    textLetterSpacing: string;
    textJustify: string;
    textRadialOffset: string;
    textVariableAnchor: string;
    textAnchor: string;
    textMaxAngle: string;
    textWritingMode: string;
    textRotate: string;
    textPadding: string;
    textKeepUpright: string;
    textTransform: string;
    textOffset: string;
    textAllowOverlap: string;
    textIgnorePlacement: string;
    textOptional: string;
    iconOpacity: string;
    iconOpacityTransition: string;
    iconColor: string;
    iconColorTransition: string;
    iconHaloColor: string;
    iconHaloColorTransition: string;
    iconHaloWidth: string;
    iconHaloWidthTransition: string;
    iconHaloBlur: string;
    iconHaloBlurTransition: string;
    iconTranslate: string;
    iconTranslateTransition: string;
    iconTranslateAnchor: string;
    textOpacity: string;
    textOpacityTransition: string;
    textColor: string;
    textColorTransition: string;
    textHaloColor: string;
    textHaloColorTransition: string;
    textHaloWidth: string;
    textHaloWidthTransition: string;
    textHaloBlur: string;
    textHaloBlurTransition: string;
    textTranslate: string;
    textTranslateTransition: string;
    textTranslateAnchor: string;
    circleSortKey: string;
    circleRadius: string;
    circleRadiusTransition: string;
    circleColor: string;
    circleColorTransition: string;
    circleBlur: string;
    circleBlurTransition: string;
    circleOpacity: string;
    circleOpacityTransition: string;
    circleTranslate: string;
    circleTranslateTransition: string;
    circleTranslateAnchor: string;
    circlePitchScale: string;
    circlePitchAlignment: string;
    circleStrokeWidth: string;
    circleStrokeWidthTransition: string;
    circleStrokeColor: string;
    circleStrokeColorTransition: string;
    circleStrokeOpacity: string;
    circleStrokeOpacityTransition: string;
    heatmapRadius: string;
    heatmapRadiusTransition: string;
    heatmapWeight: string;
    heatmapIntensity: string;
    heatmapIntensityTransition: string;
    heatmapColor: string;
    heatmapOpacity: string;
    heatmapOpacityTransition: string;
    fillExtrusionOpacity: string;
    fillExtrusionOpacityTransition: string;
    fillExtrusionColor: string;
    fillExtrusionColorTransition: string;
    fillExtrusionTranslate: string;
    fillExtrusionTranslateTransition: string;
    fillExtrusionTranslateAnchor: string;
    fillExtrusionPattern: string;
    fillExtrusionPatternTransition: string;
    fillExtrusionHeight: string;
    fillExtrusionHeightTransition: string;
    fillExtrusionBase: string;
    fillExtrusionBaseTransition: string;
    fillExtrusionVerticalGradient: string;
    fillExtrusionAmbientOcclusionIntensity: string;
    fillExtrusionAmbientOcclusionIntensityTransition: string;
    fillExtrusionAmbientOcclusionRadius: string;
    fillExtrusionAmbientOcclusionRadiusTransition: string;
    rasterOpacity: string;
    rasterOpacityTransition: string;
    rasterHueRotate: string;
    rasterHueRotateTransition: string;
    rasterBrightnessMin: string;
    rasterBrightnessMinTransition: string;
    rasterBrightnessMax: string;
    rasterBrightnessMaxTransition: string;
    rasterSaturation: string;
    rasterSaturationTransition: string;
    rasterContrast: string;
    rasterContrastTransition: string;
    rasterResampling: string;
    rasterFadeDuration: string;
    hillshadeIlluminationDirection: string;
    hillshadeIlluminationAnchor: string;
    hillshadeExaggeration: string;
    hillshadeExaggerationTransition: string;
    hillshadeShadowColor: string;
    hillshadeShadowColorTransition: string;
    hillshadeHighlightColor: string;
    hillshadeHighlightColorTransition: string;
    hillshadeAccentColor: string;
    hillshadeAccentColorTransition: string;
    backgroundColor: string;
    backgroundColorTransition: string;
    backgroundPattern: string;
    backgroundPatternTransition: string;
    backgroundOpacity: string;
    backgroundOpacityTransition: string;
    skyType: string;
    skyAtmosphereSun: string;
    skyAtmosphereSunIntensity: string;
    skyGradientCenter: string;
    skyGradientRadius: string;
    skyGradient: string;
    skyAtmosphereHaloColor: string;
    skyAtmosphereColor: string;
    skyOpacity: string;
    skyOpacityTransition: string;
    anchor: string;
    position: string;
    positionTransition: string;
    intensity: string;
    intensityTransition: string;
    range: string;
    rangeTransition: string;
    highColor: string;
    highColorTransition: string;
    spaceColor: string;
    spaceColorTransition: string;
    horizonBlend: string;
    horizonBlendTransition: string;
    starIntensity: string;
    starIntensityTransition: string;
    color: string;
    colorTransition: string;
    visibility: string;
};
export declare const styleExtras: {
    iconTextFitPadding: {
        iosType: string;
    };
    iconOffset: {
        iosType: string;
    };
    textOffset: {
        iosType: string;
    };
    lineOffset: {
        iosType: string;
    };
    fillTranslate: {
        iosType: string;
    };
    lineTranslate: {
        iosType: string;
    };
    iconTranslate: {
        iosType: string;
    };
    textTranslate: {
        iosType: string;
    };
    circleTranslate: {
        iosType: string;
    };
    fillExtrusionTranslate: {
        iosType: string;
    };
};
export default styleMap;
//# sourceMappingURL=styleMap.d.ts.map