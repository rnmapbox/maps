/* This file was generated from MapboxStyle.ts.ejs do not modify */
import { type ImageSourcePropType } from 'react-native';

export type Translation = { x: number; y: number } | [number, number];

export interface Transition {
  duration: number;
  delay: number;
}

export type FormattedString = string; /* TODO */

type ExpressionName =
  // Types
  | 'array'
  | 'boolean'
  | 'collator'
  | 'format'
  | 'image'
  | 'literal'
  | 'number'
  | 'number-format'
  | 'object'
  | 'string'
  | 'to-boolean'
  | 'to-color'
  | 'to-number'
  | 'to-string'
  | 'typeof'
  // Feature data
  | 'accumulated'
  | 'feature-state'
  | 'geometry-type'
  | 'id'
  | 'line-progress'
  | 'properties'
  // Lookup
  | 'at'
  | 'get'
  | 'has'
  | 'in'
  | 'index-of'
  | 'length'
  | 'slice'
  // Decision
  | '!'
  | '!='
  | '<'
  | '<='
  | '=='
  | '>'
  | '>='
  | 'all'
  | 'any'
  | 'case'
  | 'match'
  | 'coalesce'
  | 'within'
  // Ramps, scales, curves
  | 'interpolate'
  | 'interpolate-hcl'
  | 'interpolate-lab'
  | 'step'
  // Variable binding
  | 'let'
  | 'var'
  // String
  | 'concat'
  | 'downcase'
  | 'is-supported-script'
  | 'resolved-locale'
  | 'upcase'
  // Color
  | 'rgb'
  | 'rgba'
  | 'to-rgba'
  // Math
  | '-'
  | '*'
  | '/'
  | '%'
  | '^'
  | '+'
  | 'abs'
  | 'acos'
  | 'asin'
  | 'atan'
  | 'ceil'
  | 'cos'
  | 'distance'
  | 'e'
  | 'floor'
  | 'ln'
  | 'ln2'
  | 'log10'
  | 'log2'
  | 'max'
  | 'min'
  | 'pi'
  | 'round'
  | 'sin'
  | 'sqrt'
  | 'tan'
  // Zoom, Heatmap
  | 'zoom'
  | 'heatmap-density';

type ExpressionField =
  | string
  | number
  | boolean
  | Expression
  | ExpressionField[]
  | { [key: string]: ExpressionField };

export type Expression = readonly [ExpressionName, ...ExpressionField[]];

export type FilterExpression = Expression;

type ExpressionParameters =
  | 'zoom'
  | 'feature'
  | 'feature-state'
  | 'sky-radial-progress'
  | 'line-progress'
  | 'heatmap-density';

type ResolvedImageType = ImageSourcePropType | string;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Value<T, AllowedParameters extends ExpressionParameters[] = []> =
  | T
  | Expression;

enum VisibilityEnum {
  /** The layer is shown. */
  Visible = 'visible',
  /** The layer is not shown. */
  None = 'none',
}
type VisibilityEnumValues = 'visible' | 'none';
enum FillTranslateAnchorEnum {
  /** The fill is translated relative to the map. */
  Map = 'map',
  /** The fill is translated relative to the viewport. */
  Viewport = 'viewport',
}
type FillTranslateAnchorEnumValues = 'map' | 'viewport';
enum LineCapEnum {
  /** A cap with a squared-off end which is drawn to the exact endpoint of the line. */
  Butt = 'butt',
  /** A cap with a rounded end which is drawn beyond the endpoint of the line at a radius of one-half of the line's width and centered on the endpoint of the line. */
  Round = 'round',
  /** A cap with a squared-off end which is drawn beyond the endpoint of the line at a distance of one-half of the line's width. */
  Square = 'square',
}
type LineCapEnumValues = 'butt' | 'round' | 'square';
enum LineJoinEnum {
  /** A join with a squared-off end which is drawn beyond the endpoint of the line at a distance of one-half of the line's width. */
  Bevel = 'bevel',
  /** A join with a rounded end which is drawn beyond the endpoint of the line at a radius of one-half of the line's width and centered on the endpoint of the line. */
  Round = 'round',
  /** A join with a sharp, angled corner which is drawn with the outer sides beyond the endpoint of the path until they meet. */
  Miter = 'miter',
}
type LineJoinEnumValues = 'bevel' | 'round' | 'miter';
enum LineTranslateAnchorEnum {
  /** The line is translated relative to the map. */
  Map = 'map',
  /** The line is translated relative to the viewport. */
  Viewport = 'viewport',
}
type LineTranslateAnchorEnumValues = 'map' | 'viewport';
enum SymbolPlacementEnum {
  /** The label is placed at the point where the geometry is located. */
  Point = 'point',
  /** The label is placed along the line of the geometry. Can only be used on `LineString` and `Polygon` geometries. */
  Line = 'line',
  /** The label is placed at the center of the line of the geometry. Can only be used on `LineString` and `Polygon` geometries. Note that a single feature in a vector tile may contain multiple line geometries. */
  LineCenter = 'line-center',
}
type SymbolPlacementEnumValues = 'point' | 'line' | 'line-center';
enum SymbolZOrderEnum {
  /** Sorts symbols by `symbol-sort-key` if set. Otherwise, sorts symbols by their y-position relative to the viewport if `icon-allow-overlap` or `text-allow-overlap` is set to `true` or `icon-ignore-placement` or `text-ignore-placement` is `false`. */
  Auto = 'auto',
  /** Sorts symbols by their y-position relative to the viewport if `icon-allow-overlap` or `text-allow-overlap` is set to `true` or `icon-ignore-placement` or `text-ignore-placement` is `false`. */
  ViewportY = 'viewport-y',
  /** Sorts symbols by `symbol-sort-key` if set. Otherwise, no sorting is applied; symbols are rendered in the same order as the source data. */
  Source = 'source',
}
type SymbolZOrderEnumValues = 'auto' | 'viewport-y' | 'source';
enum IconRotationAlignmentEnum {
  /** When `symbol-placement` is set to `point`, aligns icons east-west. When `symbol-placement` is set to `line` or `line-center`, aligns icon x-axes with the line. */
  Map = 'map',
  /** Produces icons whose x-axes are aligned with the x-axis of the viewport, regardless of the value of `symbol-placement`. */
  Viewport = 'viewport',
  /** When `symbol-placement` is set to `point`, this is equivalent to `viewport`. When `symbol-placement` is set to `line` or `line-center`, this is equivalent to `map`. */
  Auto = 'auto',
}
type IconRotationAlignmentEnumValues = 'map' | 'viewport' | 'auto';
enum IconTextFitEnum {
  /** The icon is displayed at its intrinsic aspect ratio. */
  None = 'none',
  /** The icon is scaled in the x-dimension to fit the width of the text. */
  Width = 'width',
  /** The icon is scaled in the y-dimension to fit the height of the text. */
  Height = 'height',
  /** The icon is scaled in both x- and y-dimensions. */
  Both = 'both',
}
type IconTextFitEnumValues = 'none' | 'width' | 'height' | 'both';
enum IconAnchorEnum {
  /** The center of the icon is placed closest to the anchor. */
  Center = 'center',
  /** The left side of the icon is placed closest to the anchor. */
  Left = 'left',
  /** The right side of the icon is placed closest to the anchor. */
  Right = 'right',
  /** The top of the icon is placed closest to the anchor. */
  Top = 'top',
  /** The bottom of the icon is placed closest to the anchor. */
  Bottom = 'bottom',
  /** The top left corner of the icon is placed closest to the anchor. */
  TopLeft = 'top-left',
  /** The top right corner of the icon is placed closest to the anchor. */
  TopRight = 'top-right',
  /** The bottom left corner of the icon is placed closest to the anchor. */
  BottomLeft = 'bottom-left',
  /** The bottom right corner of the icon is placed closest to the anchor. */
  BottomRight = 'bottom-right',
}
type IconAnchorEnumValues =
  | 'center'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
enum IconPitchAlignmentEnum {
  /** The icon is aligned to the plane of the map. */
  Map = 'map',
  /** The icon is aligned to the plane of the viewport. */
  Viewport = 'viewport',
  /** Automatically matches the value of `icon-rotation-alignment`. */
  Auto = 'auto',
}
type IconPitchAlignmentEnumValues = 'map' | 'viewport' | 'auto';
enum TextPitchAlignmentEnum {
  /** The text is aligned to the plane of the map. */
  Map = 'map',
  /** The text is aligned to the plane of the viewport. */
  Viewport = 'viewport',
  /** Automatically matches the value of `text-rotation-alignment`. */
  Auto = 'auto',
}
type TextPitchAlignmentEnumValues = 'map' | 'viewport' | 'auto';
enum TextRotationAlignmentEnum {
  /** When `symbol-placement` is set to `point`, aligns text east-west. When `symbol-placement` is set to `line` or `line-center`, aligns text x-axes with the line. */
  Map = 'map',
  /** Produces glyphs whose x-axes are aligned with the x-axis of the viewport, regardless of the value of `symbol-placement`. */
  Viewport = 'viewport',
  /** When `symbol-placement` is set to `point`, this is equivalent to `viewport`. When `symbol-placement` is set to `line` or `line-center`, this is equivalent to `map`. */
  Auto = 'auto',
}
type TextRotationAlignmentEnumValues = 'map' | 'viewport' | 'auto';
enum TextJustifyEnum {
  /** The text is aligned towards the anchor position. */
  Auto = 'auto',
  /** The text is aligned to the left. */
  Left = 'left',
  /** The text is centered. */
  Center = 'center',
  /** The text is aligned to the right. */
  Right = 'right',
}
type TextJustifyEnumValues = 'auto' | 'left' | 'center' | 'right';
enum TextVariableAnchorEnum {
  /** The center of the text is placed closest to the anchor. */
  Center = 'center',
  /** The left side of the text is placed closest to the anchor. */
  Left = 'left',
  /** The right side of the text is placed closest to the anchor. */
  Right = 'right',
  /** The top of the text is placed closest to the anchor. */
  Top = 'top',
  /** The bottom of the text is placed closest to the anchor. */
  Bottom = 'bottom',
  /** The top left corner of the text is placed closest to the anchor. */
  TopLeft = 'top-left',
  /** The top right corner of the text is placed closest to the anchor. */
  TopRight = 'top-right',
  /** The bottom left corner of the text is placed closest to the anchor. */
  BottomLeft = 'bottom-left',
  /** The bottom right corner of the text is placed closest to the anchor. */
  BottomRight = 'bottom-right',
}
type TextVariableAnchorEnumValues =
  | 'center'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
enum TextAnchorEnum {
  /** The center of the text is placed closest to the anchor. */
  Center = 'center',
  /** The left side of the text is placed closest to the anchor. */
  Left = 'left',
  /** The right side of the text is placed closest to the anchor. */
  Right = 'right',
  /** The top of the text is placed closest to the anchor. */
  Top = 'top',
  /** The bottom of the text is placed closest to the anchor. */
  Bottom = 'bottom',
  /** The top left corner of the text is placed closest to the anchor. */
  TopLeft = 'top-left',
  /** The top right corner of the text is placed closest to the anchor. */
  TopRight = 'top-right',
  /** The bottom left corner of the text is placed closest to the anchor. */
  BottomLeft = 'bottom-left',
  /** The bottom right corner of the text is placed closest to the anchor. */
  BottomRight = 'bottom-right',
}
type TextAnchorEnumValues =
  | 'center'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
enum TextWritingModeEnum {
  /** If a text's language supports horizontal writing mode, symbols would be laid out horizontally. */
  Horizontal = 'horizontal',
  /** If a text's language supports vertical writing mode, symbols would be laid out vertically. */
  Vertical = 'vertical',
}
type TextWritingModeEnumValues = 'horizontal' | 'vertical';
enum TextTransformEnum {
  /** The text is not altered. */
  None = 'none',
  /** Forces all letters to be displayed in uppercase. */
  Uppercase = 'uppercase',
  /** Forces all letters to be displayed in lowercase. */
  Lowercase = 'lowercase',
}
type TextTransformEnumValues = 'none' | 'uppercase' | 'lowercase';
enum IconTranslateAnchorEnum {
  /** Icons are translated relative to the map. */
  Map = 'map',
  /** Icons are translated relative to the viewport. */
  Viewport = 'viewport',
}
type IconTranslateAnchorEnumValues = 'map' | 'viewport';
enum TextTranslateAnchorEnum {
  /** The text is translated relative to the map. */
  Map = 'map',
  /** The text is translated relative to the viewport. */
  Viewport = 'viewport',
}
type TextTranslateAnchorEnumValues = 'map' | 'viewport';
enum CircleTranslateAnchorEnum {
  /** The circle is translated relative to the map. */
  Map = 'map',
  /** The circle is translated relative to the viewport. */
  Viewport = 'viewport',
}
type CircleTranslateAnchorEnumValues = 'map' | 'viewport';
enum CirclePitchScaleEnum {
  /** Circles are scaled according to their apparent distance to the camera. */
  Map = 'map',
  /** Circles are not scaled. */
  Viewport = 'viewport',
}
type CirclePitchScaleEnumValues = 'map' | 'viewport';
enum CirclePitchAlignmentEnum {
  /** The circle is aligned to the plane of the map. */
  Map = 'map',
  /** The circle is aligned to the plane of the viewport. */
  Viewport = 'viewport',
}
type CirclePitchAlignmentEnumValues = 'map' | 'viewport';
enum FillExtrusionTranslateAnchorEnum {
  /** The fill extrusion is translated relative to the map. */
  Map = 'map',
  /** The fill extrusion is translated relative to the viewport. */
  Viewport = 'viewport',
}
type FillExtrusionTranslateAnchorEnumValues = 'map' | 'viewport';
enum RasterResamplingEnum {
  /** (Bi)linear filtering interpolates pixel values using the weighted average of the four closest original source pixels creating a smooth but blurry look when overscaled */
  Linear = 'linear',
  /** Nearest neighbor filtering interpolates pixel values using the nearest original source pixel creating a sharp but pixelated look when overscaled */
  Nearest = 'nearest',
}
type RasterResamplingEnumValues = 'linear' | 'nearest';
enum HillshadeIlluminationAnchorEnum {
  /** The hillshade illumination is relative to the north direction. */
  Map = 'map',
  /** The hillshade illumination is relative to the top of the viewport. */
  Viewport = 'viewport',
}
type HillshadeIlluminationAnchorEnumValues = 'map' | 'viewport';
enum ModelTypeEnum {
  /** Integrated to 3D scene, using depth testing, along with terrain, fill-extrusions and custom layer. */
  Common3d = 'common-3d',
  /** Displayed over other 3D content, occluded by terrain. */
  LocationIndicator = 'location-indicator',
}
type ModelTypeEnumValues = 'common-3d' | 'location-indicator';
enum SkyTypeEnum {
  /** Renders the sky with a gradient that can be configured with `sky-gradient-radius` and `sky-gradient`. */
  Gradient = 'gradient',
  /** Renders the sky with a simulated atmospheric scattering algorithm, the sun direction can be attached to the light position or explicitly set through `sky-atmosphere-sun`. */
  Atmosphere = 'atmosphere',
}
type SkyTypeEnumValues = 'gradient' | 'atmosphere';
enum AnchorEnum {
  /** The position of the light source is aligned to the rotation of the map. */
  Map = 'map',
  /** The position of the light source is aligned to the rotation of the viewport. */
  Viewport = 'viewport',
}
type AnchorEnumValues = 'map' | 'viewport';

type Enum<EnumType, EnumValues> = EnumType | EnumValues;

export interface FillLayerStyleProps {
  /**
   * Sorts features in ascending order based on this value. Features with a higher sort key will appear above features with a lower sort key.
   */
  fillSortKey?: Value<number, ['zoom', 'feature']>;
  /**
   * Whether this layer is displayed.
   */
  visibility?: Value<Enum<VisibilityEnum, VisibilityEnumValues>>;
  /**
   * Whether or not the fill should be antialiased.
   */
  fillAntialias?: Value<boolean, ['zoom']>;
  /**
   * The opacity of the entire fill layer. In contrast to the `fillColor`, this value will also affect the 1px stroke around the fill, if the stroke is used.
   */
  fillOpacity?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s fillOpacity property.
   */
  fillOpacityTransition?: Transition;
  /**
   * The color of the filled part of this layer. This color can be specified as `rgba` with an alpha component and the color's opacity will not affect the opacity of the 1px stroke, if it is used.
   *
   * @disabledBy fillPattern
   */
  fillColor?: Value<
    string,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s fillColor property.
   */
  fillColorTransition?: Transition;
  /**
   * The outline color of the fill. Matches the value of `fillColor` if unspecified.
   *
   * @disabledBy fillPattern
   */
  fillOutlineColor?: Value<
    string,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s fillOutlineColor property.
   */
  fillOutlineColorTransition?: Transition;
  /**
   * The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively.
   */
  fillTranslate?: Value<Translation, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s fillTranslate property.
   */
  fillTranslateTransition?: Transition;
  /**
   * Controls the frame of reference for `fillTranslate`.
   *
   * @requires fillTranslate
   */
  fillTranslateAnchor?: Value<
    Enum<FillTranslateAnchorEnum, FillTranslateAnchorEnumValues>,
    ['zoom']
  >;
  /**
   * Name of image in sprite to use for drawing image fills. For seamless patterns, image width and height must be a factor of two (2, 4, 8, ..., 512). Note that zoomDependent expressions will be evaluated only at integer zoom levels.
   */
  fillPattern?: Value<ResolvedImageType, ['zoom', 'feature']>;
  /**
   * Controls the intensity of light emitted on the source features.
   *
   * @requires lights
   */
  fillEmissiveStrength?: Value<number, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s fillEmissiveStrength property.
   */
  fillEmissiveStrengthTransition?: Transition;
}
export interface LineLayerStyleProps {
  /**
   * The display of line endings.
   */
  lineCap?: Value<Enum<LineCapEnum, LineCapEnumValues>, ['zoom', 'feature']>;
  /**
   * The display of lines when joining.
   */
  lineJoin?: Value<Enum<LineJoinEnum, LineJoinEnumValues>, ['zoom', 'feature']>;
  /**
   * Used to automatically convert miter joins to bevel joins for sharp angles.
   */
  lineMiterLimit?: Value<number, ['zoom']>;
  /**
   * Used to automatically convert round joins to miter joins for shallow angles.
   */
  lineRoundLimit?: Value<number, ['zoom']>;
  /**
   * Sorts features in ascending order based on this value. Features with a higher sort key will appear above features with a lower sort key.
   */
  lineSortKey?: Value<number, ['zoom', 'feature']>;
  /**
   * Whether this layer is displayed.
   */
  visibility?: Value<Enum<VisibilityEnum, VisibilityEnumValues>>;
  /**
   * The opacity at which the line will be drawn.
   */
  lineOpacity?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s lineOpacity property.
   */
  lineOpacityTransition?: Transition;
  /**
   * The color with which the line will be drawn.
   *
   * @disabledBy linePattern
   */
  lineColor?: Value<
    string,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s lineColor property.
   */
  lineColorTransition?: Transition;
  /**
   * The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively.
   */
  lineTranslate?: Value<Translation, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s lineTranslate property.
   */
  lineTranslateTransition?: Transition;
  /**
   * Controls the frame of reference for `lineTranslate`.
   *
   * @requires lineTranslate
   */
  lineTranslateAnchor?: Value<
    Enum<LineTranslateAnchorEnum, LineTranslateAnchorEnumValues>,
    ['zoom']
  >;
  /**
   * Stroke thickness.
   */
  lineWidth?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s lineWidth property.
   */
  lineWidthTransition?: Transition;
  /**
   * Draws a line casing outside of a line's actual path. Value indicates the width of the inner gap.
   */
  lineGapWidth?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s lineGapWidth property.
   */
  lineGapWidthTransition?: Transition;
  /**
   * The line's offset. For linear features, a positive value offsets the line to the right, relative to the direction of the line, and a negative value to the left. For polygon features, a positive value results in an inset, and a negative value results in an outset.
   */
  lineOffset?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s lineOffset property.
   */
  lineOffsetTransition?: Transition;
  /**
   * Blur applied to the line, in pixels.
   */
  lineBlur?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s lineBlur property.
   */
  lineBlurTransition?: Transition;
  /**
   * Specifies the lengths of the alternating dashes and gaps that form the dash pattern. The lengths are later scaled by the line width. To convert a dash length to pixels, multiply the length by the current line width. Note that GeoJSON sources with `lineMetrics: true` specified won't render dashed lines to the expected scale. Also note that zoomDependent expressions will be evaluated only at integer zoom levels.
   *
   * @disabledBy linePattern
   */
  lineDasharray?: Value<number[], ['zoom', 'feature']>;
  /**
   * Name of image in sprite to use for drawing image lines. For seamless patterns, image width must be a factor of two (2, 4, 8, ..., 512). Note that zoomDependent expressions will be evaluated only at integer zoom levels.
   */
  linePattern?: Value<ResolvedImageType, ['zoom', 'feature']>;
  /**
   * A gradient used to color a line feature at various distances along its length. Defined using a `step` or `interpolate` expression which outputs a color for each corresponding `lineProgress` input value. `lineProgress` is a percentage of the line feature's total length as measured on the webmercator projected coordinate plane (a `number` between `0` and `1`). Can only be used with GeoJSON sources that specify `"lineMetrics": true`.
   *
   * @disabledBy linePattern
   */
  lineGradient?: Value<string, ['line-progress']>;
  /**
   * The line part between [trimStart, trimEnd] will be marked as transparent to make a route vanishing effect. The line trimOff offset is based on the whole line range [0.0, 1.0].
   */
  lineTrimOffset?: number[];
  /**
   * Controls the intensity of light emitted on the source features.
   *
   * @requires lights
   */
  lineEmissiveStrength?: Value<number, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s lineEmissiveStrength property.
   */
  lineEmissiveStrengthTransition?: Transition;
}
export interface SymbolLayerStyleProps {
  /**
   * Label placement relative to its geometry.
   */
  symbolPlacement?: Value<
    Enum<SymbolPlacementEnum, SymbolPlacementEnumValues>,
    ['zoom']
  >;
  /**
   * Distance between two symbol anchors.
   */
  symbolSpacing?: Value<number, ['zoom']>;
  /**
   * If true, the symbols will not cross tile edges to avoid mutual collisions. Recommended in layers that don't have enough padding in the vector tile to prevent collisions, or if it is a point symbol layer placed after a line symbol layer. When using a client that supports global collision detection, like Mapbox GL JS version 0.42.0 or greater, enabling this property is not needed to prevent clipped labels at tile boundaries.
   */
  symbolAvoidEdges?: Value<boolean, ['zoom']>;
  /**
   * Sorts features in ascending order based on this value. Features with lower sort keys are drawn and placed first. When `iconAllowOverlap` or `textAllowOverlap` is `false`, features with a lower sort key will have priority during placement. When `iconAllowOverlap` or `textAllowOverlap` is set to `true`, features with a higher sort key will overlap over features with a lower sort key.
   */
  symbolSortKey?: Value<number, ['zoom', 'feature']>;
  /**
   * Determines whether overlapping symbols in the same layer are rendered in the order that they appear in the data source or by their yPosition relative to the viewport. To control the order and prioritization of symbols otherwise, use `symbolSortKey`.
   */
  symbolZOrder?: Value<
    Enum<SymbolZOrderEnum, SymbolZOrderEnumValues>,
    ['zoom']
  >;
  /**
   * If true, the icon will be visible even if it collides with other previously drawn symbols.
   *
   * @requires iconImage
   */
  iconAllowOverlap?: Value<boolean, ['zoom']>;
  /**
   * If true, other symbols can be visible even if they collide with the icon.
   *
   * @requires iconImage
   */
  iconIgnorePlacement?: Value<boolean, ['zoom']>;
  /**
   * If true, text will display without their corresponding icons when the icon collides with other symbols and the text does not.
   *
   * @requires iconImage, textField
   */
  iconOptional?: Value<boolean, ['zoom']>;
  /**
   * In combination with `symbolPlacement`, determines the rotation behavior of icons.
   *
   * @requires iconImage
   */
  iconRotationAlignment?: Value<
    Enum<IconRotationAlignmentEnum, IconRotationAlignmentEnumValues>,
    ['zoom']
  >;
  /**
   * Scales the original size of the icon by the provided factor. The new pixel size of the image will be the original pixel size multiplied by `iconSize`. 1 is the original size; 3 triples the size of the image.
   *
   * @requires iconImage
   */
  iconSize?: Value<number, ['zoom', 'feature']>;
  /**
   * Scales the icon to fit around the associated text.
   *
   * @requires iconImage, textField
   */
  iconTextFit?: Value<
    Enum<IconTextFitEnum, IconTextFitEnumValues>,
    ['zoom', 'feature']
  >;
  /**
   * Size of the additional area added to dimensions determined by `iconTextFit`, in clockwise order: top, right, bottom, left.
   *
   * @requires iconImage, textField
   */
  iconTextFitPadding?: Value<number[], ['zoom', 'feature']>;
  /**
   * Name of image in sprite to use for drawing an image background.
   */
  iconImage?: Value<ResolvedImageType, ['zoom', 'feature']>;
  /**
   * Rotates the icon clockwise.
   *
   * @requires iconImage
   */
  iconRotate?: Value<number, ['zoom', 'feature']>;
  /**
   * Size of the additional area around the icon bounding box used for detecting symbol collisions.
   *
   * @requires iconImage
   */
  iconPadding?: Value<number, ['zoom']>;
  /**
   * If true, the icon may be flipped to prevent it from being rendered upsideDown.
   *
   * @requires iconImage
   */
  iconKeepUpright?: Value<boolean, ['zoom']>;
  /**
   * Offset distance of icon from its anchor. Positive values indicate right and down, while negative values indicate left and up. Each component is multiplied by the value of `iconSize` to obtain the final offset in pixels. When combined with `iconRotate` the offset will be as if the rotated direction was up.
   *
   * @requires iconImage
   */
  iconOffset?: Value<number[], ['zoom', 'feature']>;
  /**
   * Part of the icon placed closest to the anchor.
   *
   * @requires iconImage
   */
  iconAnchor?: Value<
    Enum<IconAnchorEnum, IconAnchorEnumValues>,
    ['zoom', 'feature']
  >;
  /**
   * Orientation of icon when map is pitched.
   *
   * @requires iconImage
   */
  iconPitchAlignment?: Value<
    Enum<IconPitchAlignmentEnum, IconPitchAlignmentEnumValues>,
    ['zoom']
  >;
  /**
   * Orientation of text when map is pitched.
   *
   * @requires textField
   */
  textPitchAlignment?: Value<
    Enum<TextPitchAlignmentEnum, TextPitchAlignmentEnumValues>,
    ['zoom']
  >;
  /**
   * In combination with `symbolPlacement`, determines the rotation behavior of the individual glyphs forming the text.
   *
   * @requires textField
   */
  textRotationAlignment?: Value<
    Enum<TextRotationAlignmentEnum, TextRotationAlignmentEnumValues>,
    ['zoom']
  >;
  /**
   * Value to use for a text label. If a plain `string` is provided, it will be treated as a `formatted` with default/inherited formatting options. SDF images are not supported in formatted text and will be ignored.
   */
  textField?: Value<FormattedString, ['zoom', 'feature']>;
  /**
   * Font stack to use for displaying text.
   *
   * @requires textField
   */
  textFont?: Value<string[], ['zoom', 'feature']>;
  /**
   * Font size.
   *
   * @requires textField
   */
  textSize?: Value<number, ['zoom', 'feature']>;
  /**
   * The maximum line width for text wrapping.
   *
   * @requires textField
   */
  textMaxWidth?: Value<number, ['zoom', 'feature']>;
  /**
   * Text leading value for multiLine text.
   *
   * @requires textField
   */
  textLineHeight?: Value<number, ['zoom', 'feature']>;
  /**
   * Text tracking amount.
   *
   * @requires textField
   */
  textLetterSpacing?: Value<number, ['zoom', 'feature']>;
  /**
   * Text justification options.
   *
   * @requires textField
   */
  textJustify?: Value<
    Enum<TextJustifyEnum, TextJustifyEnumValues>,
    ['zoom', 'feature']
  >;
  /**
   * Radial offset of text, in the direction of the symbol's anchor. Useful in combination with `textVariableAnchor`, which defaults to using the twoDimensional `textOffset` if present.
   *
   * @requires textField
   */
  textRadialOffset?: Value<number, ['zoom', 'feature']>;
  /**
   * To increase the chance of placing highPriority labels on the map, you can provide an array of `textAnchor` locations: the renderer will attempt to place the label at each location, in order, before moving onto the next label. Use `textJustify: auto` to choose justification based on anchor position. To apply an offset, use the `textRadialOffset` or the twoDimensional `textOffset`.
   *
   * @requires textField
   */
  textVariableAnchor?: Value<
    Enum<TextVariableAnchorEnum, TextVariableAnchorEnumValues>[],
    ['zoom']
  >;
  /**
   * Part of the text placed closest to the anchor.
   *
   * @requires textField
   *
   * @disabledBy textVariableAnchor
   */
  textAnchor?: Value<
    Enum<TextAnchorEnum, TextAnchorEnumValues>,
    ['zoom', 'feature']
  >;
  /**
   * Maximum angle change between adjacent characters.
   *
   * @requires textField
   */
  textMaxAngle?: Value<number, ['zoom']>;
  /**
   * The property allows control over a symbol's orientation. Note that the property values act as a hint, so that a symbol whose language doesn’t support the provided orientation will be laid out in its natural orientation. Example: English point symbol will be rendered horizontally even if array value contains single 'vertical' enum value. For symbol with point placement, the order of elements in an array define priority order for the placement of an orientation variant. For symbol with line placement, the default text writing mode is either ['horizontal', 'vertical'] or ['vertical', 'horizontal'], the order doesn't affect the placement.
   *
   * @requires textField
   */
  textWritingMode?: Value<
    Enum<TextWritingModeEnum, TextWritingModeEnumValues>[],
    ['zoom']
  >;
  /**
   * Rotates the text clockwise.
   *
   * @requires textField
   */
  textRotate?: Value<number, ['zoom', 'feature']>;
  /**
   * Size of the additional area around the text bounding box used for detecting symbol collisions.
   *
   * @requires textField
   */
  textPadding?: Value<number, ['zoom']>;
  /**
   * If true, the text may be flipped vertically to prevent it from being rendered upsideDown.
   *
   * @requires textField
   */
  textKeepUpright?: Value<boolean, ['zoom']>;
  /**
   * Specifies how to capitalize text, similar to the CSS `textTransform` property.
   *
   * @requires textField
   */
  textTransform?: Value<
    Enum<TextTransformEnum, TextTransformEnumValues>,
    ['zoom', 'feature']
  >;
  /**
   * Offset distance of text from its anchor. Positive values indicate right and down, while negative values indicate left and up. If used with textVariableAnchor, input values will be taken as absolute values. Offsets along the x and yAxis will be applied automatically based on the anchor position.
   *
   * @requires textField
   *
   * @disabledBy textRadialOffset
   */
  textOffset?: Value<number[], ['zoom', 'feature']>;
  /**
   * If true, the text will be visible even if it collides with other previously drawn symbols.
   *
   * @requires textField
   */
  textAllowOverlap?: Value<boolean, ['zoom']>;
  /**
   * If true, other symbols can be visible even if they collide with the text.
   *
   * @requires textField
   */
  textIgnorePlacement?: Value<boolean, ['zoom']>;
  /**
   * If true, icons will display without their corresponding text when the text collides with other symbols and the icon does not.
   *
   * @requires textField, iconImage
   */
  textOptional?: Value<boolean, ['zoom']>;
  /**
   * Whether this layer is displayed.
   */
  visibility?: Value<Enum<VisibilityEnum, VisibilityEnumValues>>;
  /**
   * The opacity at which the icon will be drawn.
   *
   * @requires iconImage
   */
  iconOpacity?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s iconOpacity property.
   */
  iconOpacityTransition?: Transition;
  /**
   * The color of the icon. This can only be used with [SDF icons](https://docs.mapbox.com/help/troubleshooting/using-recolorable-images-in-mapbox-maps/).
   *
   * @requires iconImage
   */
  iconColor?: Value<
    string,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s iconColor property.
   */
  iconColorTransition?: Transition;
  /**
   * The color of the icon's halo. Icon halos can only be used with [SDF icons](https://docs.mapbox.com/help/troubleshooting/using-recolorable-images-in-mapbox-maps/).
   *
   * @requires iconImage
   */
  iconHaloColor?: Value<
    string,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s iconHaloColor property.
   */
  iconHaloColorTransition?: Transition;
  /**
   * Distance of halo to the icon outline.
   *
   * @requires iconImage
   */
  iconHaloWidth?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s iconHaloWidth property.
   */
  iconHaloWidthTransition?: Transition;
  /**
   * Fade out the halo towards the outside.
   *
   * @requires iconImage
   */
  iconHaloBlur?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s iconHaloBlur property.
   */
  iconHaloBlurTransition?: Transition;
  /**
   * Distance that the icon's anchor is moved from its original placement. Positive values indicate right and down, while negative values indicate left and up.
   *
   * @requires iconImage
   */
  iconTranslate?: Value<Translation, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s iconTranslate property.
   */
  iconTranslateTransition?: Transition;
  /**
   * Controls the frame of reference for `iconTranslate`.
   *
   * @requires iconImage, iconTranslate
   */
  iconTranslateAnchor?: Value<
    Enum<IconTranslateAnchorEnum, IconTranslateAnchorEnumValues>,
    ['zoom']
  >;
  /**
   * The opacity at which the text will be drawn.
   *
   * @requires textField
   */
  textOpacity?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s textOpacity property.
   */
  textOpacityTransition?: Transition;
  /**
   * The color with which the text will be drawn.
   *
   * @requires textField
   */
  textColor?: Value<
    string,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s textColor property.
   */
  textColorTransition?: Transition;
  /**
   * The color of the text's halo, which helps it stand out from backgrounds.
   *
   * @requires textField
   */
  textHaloColor?: Value<
    string,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s textHaloColor property.
   */
  textHaloColorTransition?: Transition;
  /**
   * Distance of halo to the font outline. Max text halo width is 1/4 of the fontSize.
   *
   * @requires textField
   */
  textHaloWidth?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s textHaloWidth property.
   */
  textHaloWidthTransition?: Transition;
  /**
   * The halo's fadeout distance towards the outside.
   *
   * @requires textField
   */
  textHaloBlur?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s textHaloBlur property.
   */
  textHaloBlurTransition?: Transition;
  /**
   * Distance that the text's anchor is moved from its original placement. Positive values indicate right and down, while negative values indicate left and up.
   *
   * @requires textField
   */
  textTranslate?: Value<Translation, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s textTranslate property.
   */
  textTranslateTransition?: Transition;
  /**
   * Controls the frame of reference for `textTranslate`.
   *
   * @requires textField, textTranslate
   */
  textTranslateAnchor?: Value<
    Enum<TextTranslateAnchorEnum, TextTranslateAnchorEnumValues>,
    ['zoom']
  >;
  /**
   * Position symbol on buildings (both fill extrusions and models) roof tops. In order to have minimal impact on performance, this is supported only when `fillExtrusionHeight` is not zoomDependent and not edited after initial bucket creation. For fading in buildings when zooming in, fillExtrusionVerticalScale should be used and symbols would raise with building roofs. Symbols are sorted by elevation, except in case when `viewportY` sorting or `symbolSortKey` are applied.
   */
  symbolZElevate?: Value<boolean, ['zoom']>;
  /**
   * Controls the intensity of light emitted on the source features.
   *
   * @requires lights
   */
  iconEmissiveStrength?: Value<number, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s iconEmissiveStrength property.
   */
  iconEmissiveStrengthTransition?: Transition;
  /**
   * Controls the intensity of light emitted on the source features.
   *
   * @requires lights
   */
  textEmissiveStrength?: Value<number, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s textEmissiveStrength property.
   */
  textEmissiveStrengthTransition?: Transition;
  /**
   * Controls the transition progress between the image variants of iconImage. Zero means the first variant is used, one is the second, and in between they are blended together.
   */
  iconImageCrossFade?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s iconImageCrossFade property.
   */
  iconImageCrossFadeTransition?: Transition;
}
export interface CircleLayerStyleProps {
  /**
   * Sorts features in ascending order based on this value. Features with a higher sort key will appear above features with a lower sort key.
   */
  circleSortKey?: Value<number, ['zoom', 'feature']>;
  /**
   * Whether this layer is displayed.
   */
  visibility?: Value<Enum<VisibilityEnum, VisibilityEnumValues>>;
  /**
   * Circle radius.
   */
  circleRadius?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s circleRadius property.
   */
  circleRadiusTransition?: Transition;
  /**
   * The fill color of the circle.
   */
  circleColor?: Value<
    string,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s circleColor property.
   */
  circleColorTransition?: Transition;
  /**
   * Amount to blur the circle. 1 blurs the circle such that only the centerpoint is full opacity.
   */
  circleBlur?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s circleBlur property.
   */
  circleBlurTransition?: Transition;
  /**
   * The opacity at which the circle will be drawn.
   */
  circleOpacity?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s circleOpacity property.
   */
  circleOpacityTransition?: Transition;
  /**
   * The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively.
   */
  circleTranslate?: Value<Translation, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s circleTranslate property.
   */
  circleTranslateTransition?: Transition;
  /**
   * Controls the frame of reference for `circleTranslate`.
   *
   * @requires circleTranslate
   */
  circleTranslateAnchor?: Value<
    Enum<CircleTranslateAnchorEnum, CircleTranslateAnchorEnumValues>,
    ['zoom']
  >;
  /**
   * Controls the scaling behavior of the circle when the map is pitched.
   */
  circlePitchScale?: Value<
    Enum<CirclePitchScaleEnum, CirclePitchScaleEnumValues>,
    ['zoom']
  >;
  /**
   * Orientation of circle when map is pitched.
   */
  circlePitchAlignment?: Value<
    Enum<CirclePitchAlignmentEnum, CirclePitchAlignmentEnumValues>,
    ['zoom']
  >;
  /**
   * The width of the circle's stroke. Strokes are placed outside of the `circleRadius`.
   */
  circleStrokeWidth?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s circleStrokeWidth property.
   */
  circleStrokeWidthTransition?: Transition;
  /**
   * The stroke color of the circle.
   */
  circleStrokeColor?: Value<
    string,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s circleStrokeColor property.
   */
  circleStrokeColorTransition?: Transition;
  /**
   * The opacity of the circle's stroke.
   */
  circleStrokeOpacity?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s circleStrokeOpacity property.
   */
  circleStrokeOpacityTransition?: Transition;
  /**
   * Controls the intensity of light emitted on the source features.
   *
   * @requires lights
   */
  circleEmissiveStrength?: Value<number, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s circleEmissiveStrength property.
   */
  circleEmissiveStrengthTransition?: Transition;
}
export interface HeatmapLayerStyleProps {
  /**
   * Whether this layer is displayed.
   */
  visibility?: Value<Enum<VisibilityEnum, VisibilityEnumValues>>;
  /**
   * Radius of influence of one heatmap point in pixels. Increasing the value makes the heatmap smoother, but less detailed. `queryRenderedFeatures` on heatmap layers will return points within this radius.
   */
  heatmapRadius?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s heatmapRadius property.
   */
  heatmapRadiusTransition?: Transition;
  /**
   * A measure of how much an individual point contributes to the heatmap. A value of 10 would be equivalent to having 10 points of weight 1 in the same spot. Especially useful when combined with clustering.
   */
  heatmapWeight?: Value<
    number,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;
  /**
   * Similar to `heatmapWeight` but controls the intensity of the heatmap globally. Primarily used for adjusting the heatmap based on zoom level.
   */
  heatmapIntensity?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s heatmapIntensity property.
   */
  heatmapIntensityTransition?: Transition;
  /**
   * Defines the color of each pixel based on its density value in a heatmap. Should be an expression that uses `["heatmapDensity"]` as input.
   */
  heatmapColor?: Value<string, ['heatmap-density']>;
  /**
   * The global opacity at which the heatmap layer will be drawn.
   */
  heatmapOpacity?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s heatmapOpacity property.
   */
  heatmapOpacityTransition?: Transition;
}
export interface FillExtrusionLayerStyleProps {
  /**
   * Whether this layer is displayed.
   */
  visibility?: Value<Enum<VisibilityEnum, VisibilityEnumValues>>;
  /**
   * The opacity of the entire fill extrusion layer. This is rendered on a perLayer, not perFeature, basis, and dataDriven styling is not available.
   */
  fillExtrusionOpacity?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionOpacity property.
   */
  fillExtrusionOpacityTransition?: Transition;
  /**
   * The base color of the extruded fill. The extrusion's surfaces will be shaded differently based on this color in combination with the root `light` settings. If this color is specified as `rgba` with an alpha component, the alpha component will be ignored; use `fillExtrusionOpacity` to set layer opacity.
   *
   * @disabledBy fillExtrusionPattern
   */
  fillExtrusionColor?: Value<
    string,
    ['zoom', 'feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionColor property.
   */
  fillExtrusionColorTransition?: Transition;
  /**
   * The geometry's offset. Values are [x, y] where negatives indicate left and up (on the flat plane), respectively.
   */
  fillExtrusionTranslate?: Value<Translation, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionTranslate property.
   */
  fillExtrusionTranslateTransition?: Transition;
  /**
   * Controls the frame of reference for `fillExtrusionTranslate`.
   *
   * @requires fillExtrusionTranslate
   */
  fillExtrusionTranslateAnchor?: Value<
    Enum<
      FillExtrusionTranslateAnchorEnum,
      FillExtrusionTranslateAnchorEnumValues
    >,
    ['zoom']
  >;
  /**
   * Name of image in sprite to use for drawing images on extruded fills. For seamless patterns, image width and height must be a factor of two (2, 4, 8, ..., 512). Note that zoomDependent expressions will be evaluated only at integer zoom levels.
   */
  fillExtrusionPattern?: Value<ResolvedImageType, ['zoom', 'feature']>;
  /**
   * The height with which to extrude this layer.
   */
  fillExtrusionHeight?: Value<number, ['zoom', 'feature', 'feature-state']>;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionHeight property.
   */
  fillExtrusionHeightTransition?: Transition;
  /**
   * The height with which to extrude the base of this layer. Must be less than or equal to `fillExtrusionHeight`.
   *
   * @requires fillExtrusionHeight
   */
  fillExtrusionBase?: Value<number, ['zoom', 'feature', 'feature-state']>;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionBase property.
   */
  fillExtrusionBaseTransition?: Transition;
  /**
   * Whether to apply a vertical gradient to the sides of a fillExtrusion layer. If true, sides will be shaded slightly darker farther down.
   */
  fillExtrusionVerticalGradient?: Value<boolean, ['zoom']>;
  /**
   * Indicates whether top edges should be rounded when fillExtrusionEdgeRadius has a value greater than 0. If false, rounded edges are only applied to the sides. Default is true.
   *
   * @requires fillExtrusionEdgeRadius
   */
  fillExtrusionRoundedRoof?: Value<boolean, ['zoom']>;
  /**
   * Shades area near ground and concave angles between walls where the radius defines only vertical impact. Default value 3.0 corresponds to height of one floor and brings the most plausible results for buildings.
   *
   * @requires lights, fillExtrusionEdgeRadius
   *
   * @disabledBy fillExtrusionFloodLightIntensity
   */
  fillExtrusionAmbientOcclusionWallRadius?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionAmbientOcclusionWallRadius property.
   */
  fillExtrusionAmbientOcclusionWallRadiusTransition?: Transition;
  /**
   * The extent of the ambient occlusion effect on the ground beneath the extruded buildings in meters.
   *
   * @requires lights
   *
   * @disabledBy fillExtrusionFloodLightIntensity
   */
  fillExtrusionAmbientOcclusionGroundRadius?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionAmbientOcclusionGroundRadius property.
   */
  fillExtrusionAmbientOcclusionGroundRadiusTransition?: Transition;
  /**
   * Provides a control to futher fineTune the look of the ambient occlusion on the ground beneath the extruded buildings. Lower values give the effect a more solid look while higher values make it smoother.
   *
   * @requires lights
   *
   * @disabledBy fillExtrusionFloodLightIntensity
   */
  fillExtrusionAmbientOcclusionGroundAttenuation?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionAmbientOcclusionGroundAttenuation property.
   */
  fillExtrusionAmbientOcclusionGroundAttenuationTransition?: Transition;
  /**
   * The color of the flood light effect on the walls of the extruded buildings.
   *
   * @requires lights
   *
   * @disabledBy fillExtrusionAmbientOcclusionIntensity
   */
  fillExtrusionFloodLightColor?: Value<string, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionFloodLightColor property.
   */
  fillExtrusionFloodLightColorTransition?: Transition;
  /**
   * The intensity of the flood light color.
   *
   * @requires lights
   *
   * @disabledBy fillExtrusionAmbientOcclusionIntensity
   */
  fillExtrusionFloodLightIntensity?: Value<number, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionFloodLightIntensity property.
   */
  fillExtrusionFloodLightIntensityTransition?: Transition;
  /**
   * The extent of the flood light effect on the walls of the extruded buildings in meters.
   *
   * @requires lights
   *
   * @disabledBy fillExtrusionAmbientOcclusionIntensity
   */
  fillExtrusionFloodLightWallRadius?: Value<
    number,
    ['feature', 'feature-state']
  >;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionFloodLightWallRadius property.
   */
  fillExtrusionFloodLightWallRadiusTransition?: Transition;
  /**
   * The extent of the flood light effect on the ground beneath the extruded buildings in meters.
   *
   * @requires lights
   *
   * @disabledBy fillExtrusionAmbientOcclusionIntensity
   */
  fillExtrusionFloodLightGroundRadius?: Value<
    number,
    ['feature', 'feature-state']
  >;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionFloodLightGroundRadius property.
   */
  fillExtrusionFloodLightGroundRadiusTransition?: Transition;
  /**
   * Provides a control to futher fineTune the look of the flood light on the ground beneath the extruded buildings. Lower values give the effect a more solid look while higher values make it smoother.
   *
   * @requires lights
   *
   * @disabledBy fillExtrusionAmbientOcclusionIntensity
   */
  fillExtrusionFloodLightGroundAttenuation?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionFloodLightGroundAttenuation property.
   */
  fillExtrusionFloodLightGroundAttenuationTransition?: Transition;
  /**
   * A global multiplier that can be used to scale base, height, AO, and flood light of the fill extrusions.
   */
  fillExtrusionVerticalScale?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s fillExtrusionVerticalScale property.
   */
  fillExtrusionVerticalScaleTransition?: Transition;
  /**
   * This parameter defines the range for the fadeOut effect before an automatic content cutoff on pitched map views. The automatic cutoff range is calculated according to the minimum required zoom level of the source and layer. The fade range is expressed in relation to the height of the map view. A value of 1.0 indicates that the content is faded to the same extent as the map's height in pixels, while a value close to zero represents a sharp cutoff. When the value is set to 0.0, the cutoff is completely disabled. Note: The property has no effect on the map if terrain is enabled.
   */
  fillExtrusionCutoffFadeRange?: Value<number>;
}
export interface RasterLayerStyleProps {
  /**
   * Whether this layer is displayed.
   */
  visibility?: Value<Enum<VisibilityEnum, VisibilityEnumValues>>;
  /**
   * The opacity at which the image will be drawn.
   */
  rasterOpacity?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s rasterOpacity property.
   */
  rasterOpacityTransition?: Transition;
  /**
   * Rotates hues around the color wheel.
   */
  rasterHueRotate?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s rasterHueRotate property.
   */
  rasterHueRotateTransition?: Transition;
  /**
   * Increase or reduce the brightness of the image. The value is the minimum brightness.
   */
  rasterBrightnessMin?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s rasterBrightnessMin property.
   */
  rasterBrightnessMinTransition?: Transition;
  /**
   * Increase or reduce the brightness of the image. The value is the maximum brightness.
   */
  rasterBrightnessMax?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s rasterBrightnessMax property.
   */
  rasterBrightnessMaxTransition?: Transition;
  /**
   * Increase or reduce the saturation of the image.
   */
  rasterSaturation?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s rasterSaturation property.
   */
  rasterSaturationTransition?: Transition;
  /**
   * Increase or reduce the contrast of the image.
   */
  rasterContrast?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s rasterContrast property.
   */
  rasterContrastTransition?: Transition;
  /**
   * The resampling/interpolation method to use for overscaling, also known as texture magnification filter
   */
  rasterResampling?: Value<
    Enum<RasterResamplingEnum, RasterResamplingEnumValues>,
    ['zoom']
  >;
  /**
   * Fade duration when a new tile is added.
   */
  rasterFadeDuration?: Value<number, ['zoom']>;
  /**
   * Defines a color map by which to colorize a raster layer, parameterized by the `["rasterValue"]` expression and evaluated at 256 uniformly spaced steps over the range specified by `rasterColorRange`.
   */
  rasterColor?: Value<string, ['raster-value']>;
  /**
   * When `rasterColor` is active, specifies the combination of source RGB channels used to compute the raster value. Computed using the equation `mix.r * src.r + mix.g * src.g + mix.b * src.b + mix.a`. The first three components specify the mix of source red, green, and blue channels, respectively. The fourth component serves as a constant offset and is *not* multipled by source alpha. Source alpha is instead carried through and applied as opacity to the colorized result. Default value corresponds to RGB luminosity.
   *
   * @requires rasterColor
   */
  rasterColorMix?: Value<number[], ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s rasterColorMix property.
   */
  rasterColorMixTransition?: Transition;
  /**
   * When `rasterColor` is active, specifies the range over which `rasterColor` is tabulated. Units correspond to the computed raster value via `rasterColorMix`.
   *
   * @requires rasterColor
   */
  rasterColorRange?: Value<number[], ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s rasterColorRange property.
   */
  rasterColorRangeTransition?: Transition;
}
export interface HillshadeLayerStyleProps {
  /**
   * Whether this layer is displayed.
   */
  visibility?: Value<Enum<VisibilityEnum, VisibilityEnumValues>>;
  /**
   * The direction of the light source used to generate the hillshading with 0 as the top of the viewport if `hillshadeIlluminationAnchor` is set to `viewport` and due north if `hillshadeIlluminationAnchor` is set to `map` and no 3d lights enabled. If `hillshadeIlluminationAnchor` is set to `map` and 3d lights enabled, the direction from 3d lights is used instead.
   */
  hillshadeIlluminationDirection?: Value<number, ['zoom']>;
  /**
   * Direction of light source when map is rotated.
   */
  hillshadeIlluminationAnchor?: Value<
    Enum<
      HillshadeIlluminationAnchorEnum,
      HillshadeIlluminationAnchorEnumValues
    >,
    ['zoom']
  >;
  /**
   * Intensity of the hillshade
   */
  hillshadeExaggeration?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s hillshadeExaggeration property.
   */
  hillshadeExaggerationTransition?: Transition;
  /**
   * The shading color of areas that face away from the light source.
   */
  hillshadeShadowColor?: Value<string, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s hillshadeShadowColor property.
   */
  hillshadeShadowColorTransition?: Transition;
  /**
   * The shading color of areas that faces towards the light source.
   */
  hillshadeHighlightColor?: Value<string, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s hillshadeHighlightColor property.
   */
  hillshadeHighlightColorTransition?: Transition;
  /**
   * The shading color used to accentuate rugged terrain like sharp cliffs and gorges.
   */
  hillshadeAccentColor?: Value<string, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s hillshadeAccentColor property.
   */
  hillshadeAccentColorTransition?: Transition;
}
export interface ModelLayerStyleProps {
  /**
   * Whether this layer is displayed.
   */
  visibility?: Value<Enum<VisibilityEnum, VisibilityEnumValues>>;
  /**
   * Model to render.
   */
  modelId?: Value<string, ['zoom', 'feature']>;
  /**
   * The opacity of the model layer.
   */
  modelOpacity?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s modelOpacity property.
   */
  modelOpacityTransition?: Transition;
  /**
   * The rotation of the model in euler angles [lon, lat, z].
   */
  modelRotation?: Value<number[], ['feature', 'feature-state', 'zoom']>;

  /**
   * The transition affecting any changes to this layer’s modelRotation property.
   */
  modelRotationTransition?: Transition;
  /**
   * The scale of the model. Expressions that are zoomDependent are not supported if using GeoJSON or vector tile as the model layer source.
   */
  modelScale?: Value<number[], ['feature', 'feature-state', 'zoom']>;

  /**
   * The transition affecting any changes to this layer’s modelScale property.
   */
  modelScaleTransition?: Transition;
  /**
   * The translation of the model in meters in form of [longitudal, latitudal, altitude] offsets.
   */
  modelTranslation?: Value<number[], ['feature', 'feature-state', 'zoom']>;

  /**
   * The transition affecting any changes to this layer’s modelTranslation property.
   */
  modelTranslationTransition?: Transition;
  /**
   * The tint color of the model layer. modelColorMixIntensity (defaults to 0) defines tint(mix) intensity  this means that, this color is not used unless modelColorMixIntensity gets value greater than 0. Expressions that depend on measureLight are not supported when using GeoJSON or vector tile as the model layer source.
   */
  modelColor?: Value<
    string,
    ['feature', 'feature-state', 'measure-light', 'zoom']
  >;

  /**
   * The transition affecting any changes to this layer’s modelColor property.
   */
  modelColorTransition?: Transition;
  /**
   * Intensity of modelColor (on a scale from 0 to 1) in color mix with original 3D model's colors. Higher number will present a higher modelColor contribution in mix. Expressions that depend on measureLight are not supported when using GeoJSON or vector tile as the model layer source.
   */
  modelColorMixIntensity?: Value<
    number,
    ['feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s modelColorMixIntensity property.
   */
  modelColorMixIntensityTransition?: Transition;
  /**
   * Defines rendering behavior of model in respect to other 3D scene objects.
   */
  modelType?: Enum<ModelTypeEnum, ModelTypeEnumValues>;
  /**
   * Enable/Disable shadow casting for this layer
   */
  modelCastShadows?: Value<boolean>;
  /**
   * Enable/Disable shadow receiving for this layer
   */
  modelReceiveShadows?: Value<boolean>;
  /**
   * Intensity of the ambient occlusion if present in the 3D model.
   */
  modelAmbientOcclusionIntensity?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s modelAmbientOcclusionIntensity property.
   */
  modelAmbientOcclusionIntensityTransition?: Transition;
  /**
   * Strength of the emission. There is no emission for value 0. For value 1.0, only emissive component (no shading) is displayed and values above 1.0 produce light contribution to surrounding area, for some of the parts (e.g. doors). Expressions that depend on measureLight are not supported when using GeoJSON or vector tile as the model layer source.
   */
  modelEmissiveStrength?: Value<
    number,
    ['feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s modelEmissiveStrength property.
   */
  modelEmissiveStrengthTransition?: Transition;
  /**
   * Material roughness. Material is fully smooth for value 0, and fully rough for value 1. Affects only layers using batchedModel source.
   */
  modelRoughness?: Value<number, ['feature', 'feature-state']>;

  /**
   * The transition affecting any changes to this layer’s modelRoughness property.
   */
  modelRoughnessTransition?: Transition;
  /**
   * Emissive strength multiplier along model height (gradient begin, gradient end, value at begin, value at end, gradient curve power (logarithmic scale, curve power = pow(10, val)).
   */
  modelHeightBasedEmissiveStrengthMultiplier?: Value<
    number[],
    ['feature', 'feature-state', 'measure-light']
  >;

  /**
   * The transition affecting any changes to this layer’s modelHeightBasedEmissiveStrengthMultiplier property.
   */
  modelHeightBasedEmissiveStrengthMultiplierTransition?: Transition;
  /**
   * This parameter defines the range for the fadeOut effect before an automatic content cutoff on pitched map views. The automatic cutoff range is calculated according to the minimum required zoom level of the source and layer. The fade range is expressed in relation to the height of the map view. A value of 1.0 indicates that the content is faded to the same extent as the map's height in pixels, while a value close to zero represents a sharp cutoff. When the value is set to 0.0, the cutoff is completely disabled. Note: The property has no effect on the map if terrain is enabled.
   */
  modelCutoffFadeRange?: Value<number>;
}
export interface BackgroundLayerStyleProps {
  /**
   * Whether this layer is displayed.
   */
  visibility?: Value<Enum<VisibilityEnum, VisibilityEnumValues>>;
  /**
   * The color with which the background will be drawn.
   *
   * @disabledBy backgroundPattern
   */
  backgroundColor?: Value<string, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s backgroundColor property.
   */
  backgroundColorTransition?: Transition;
  /**
   * Name of image in sprite to use for drawing an image background. For seamless patterns, image width and height must be a factor of two (2, 4, 8, ..., 512). Note that zoomDependent expressions will be evaluated only at integer zoom levels.
   */
  backgroundPattern?: Value<ResolvedImageType, ['zoom']>;
  /**
   * The opacity at which the background will be drawn.
   */
  backgroundOpacity?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s backgroundOpacity property.
   */
  backgroundOpacityTransition?: Transition;
  /**
   * Controls the intensity of light emitted on the source features.
   *
   * @requires lights
   */
  backgroundEmissiveStrength?: Value<number, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s backgroundEmissiveStrength property.
   */
  backgroundEmissiveStrengthTransition?: Transition;
}
export interface SkyLayerStyleProps {
  /**
   * Whether this layer is displayed.
   */
  visibility?: Value<Enum<VisibilityEnum, VisibilityEnumValues>>;
  /**
   * The type of the sky
   */
  skyType?: Value<Enum<SkyTypeEnum, SkyTypeEnumValues>, ['zoom']>;
  /**
   * Position of the sun center [a azimuthal angle, p polar angle]. The azimuthal angle indicates the position of the sun relative to 0° north, where degrees proceed clockwise. The polar angle indicates the height of the sun, where 0° is directly above, at zenith, and 90° at the horizon. When this property is ommitted, the sun center is directly inherited from the light position.
   */
  skyAtmosphereSun?: Value<number[], ['zoom']>;
  /**
   * Intensity of the sun as a light source in the atmosphere (on a scale from 0 to a 100). Setting higher values will brighten up the sky.
   */
  skyAtmosphereSunIntensity?: number;
  /**
   * Position of the gradient center [a azimuthal angle, p polar angle]. The azimuthal angle indicates the position of the gradient center relative to 0° north, where degrees proceed clockwise. The polar angle indicates the height of the gradient center, where 0° is directly above, at zenith, and 90° at the horizon.
   */
  skyGradientCenter?: Value<number[], ['zoom']>;
  /**
   * The angular distance (measured in degrees) from `skyGradientCenter` up to which the gradient extends. A value of 180 causes the gradient to wrap around to the opposite direction from `skyGradientCenter`.
   */
  skyGradientRadius?: Value<number, ['zoom']>;
  /**
   * Defines a radial color gradient with which to color the sky. The color values can be interpolated with an expression using `skyRadialProgress`. The range [0, 1] for the interpolant covers a radial distance (in degrees) of [0, `skyGradientRadius`] centered at the position specified by `skyGradientCenter`.
   */
  skyGradient?: Value<string, ['sky-radial-progress']>;
  /**
   * A color applied to the atmosphere sun halo. The alpha channel describes how strongly the sun halo is represented in an atmosphere sky layer.
   */
  skyAtmosphereHaloColor?: string;
  /**
   * A color used to tweak the main atmospheric scattering coefficients. Using white applies the default coefficients giving the natural blue color to the atmosphere. This color affects how heavily the corresponding wavelength is represented during scattering. The alpha channel describes the density of the atmosphere, with 1 maximum density and 0 no density.
   */
  skyAtmosphereColor?: string;
  /**
   * The opacity of the entire sky layer.
   */
  skyOpacity?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s skyOpacity property.
   */
  skyOpacityTransition?: Transition;
}
export interface LightLayerStyleProps {
  /**
   * Whether extruded geometries are lit relative to the map or viewport.
   */
  anchor?: Value<Enum<AnchorEnum, AnchorEnumValues>, ['zoom']>;
  /**
   * Position of the light source relative to lit (extruded) geometries, in [r radial coordinate, a azimuthal angle, p polar angle] where r indicates the distance from the center of the base of an object to its light, a indicates the position of the light relative to 0° (0° when `light.anchor` is set to `viewport` corresponds to the top of the viewport, or 0° when `light.anchor` is set to `map` corresponds to due north, and degrees proceed clockwise), and p indicates the height of the light (from 0°, directly above, to 180°, directly below).
   */
  position?: Value<number[], ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s position property.
   */
  positionTransition?: Transition;
  /**
   * Color tint for lighting extruded geometries.
   */
  color?: Value<string, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s color property.
   */
  colorTransition?: Transition;
  /**
   * Intensity of lighting (on a scale from 0 to 1). Higher numbers will present as more extreme contrast.
   */
  intensity?: Value<number, ['zoom']>;

  /**
   * The transition affecting any changes to this layer’s intensity property.
   */
  intensityTransition?: Transition;
}
export interface AtmosphereLayerStyleProps {
  /**
   * The start and end distance range in which fog fades from fully transparent to fully opaque. The distance to the point at the center of the map is defined as zero, so that negative range values are closer to the camera, and positive values are farther away.
   */
  range?: Value<number[], ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s range property.
   */
  rangeTransition?: Transition;
  /**
   * The color of the atmosphere region immediately below the horizon and within the `range` and above the horizon and within `horizonBlend`. Using opacity is recommended only for smoothly transitioning fog on/off as anything less than 100% opacity results in more tiles loaded and drawn.
   */
  color?: Value<string, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s color property.
   */
  colorTransition?: Transition;
  /**
   * The color of the atmosphere region above the horizon, `highColor` extends further above the horizon than the `color` property and its spread can be controlled with `horizonBlend`. The opacity can be set to `0` to remove the high atmosphere color contribution.
   */
  highColor?: Value<string, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s highColor property.
   */
  highColorTransition?: Transition;
  /**
   * The color of the region above the horizon and after the end of the `horizonBlend` contribution. The opacity can be set to `0` to have a transparent background.
   */
  spaceColor?: Value<string, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s spaceColor property.
   */
  spaceColorTransition?: Transition;
  /**
   * Horizon blend applies a smooth fade from the color of the atmosphere to the color of space. A value of zero leaves a sharp transition from atmosphere to space. Increasing the value blends the color of atmosphere into increasingly high angles of the sky.
   */
  horizonBlend?: Value<number, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s horizonBlend property.
   */
  horizonBlendTransition?: Transition;
  /**
   * A value controlling the star intensity where `0` will show no stars and `1` will show stars at their maximum intensity.
   */
  starIntensity?: Value<number, ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s starIntensity property.
   */
  starIntensityTransition?: Transition;
  /**
   * An array of two number values, specifying the vertical range, measured in meters, over which the fog should gradually fade out. When both parameters are set to zero, the fog will be rendered without any vertical constraints.
   */
  verticalRange?: Value<number[], ['zoom', 'measure-light']>;

  /**
   * The transition affecting any changes to this layer’s verticalRange property.
   */
  verticalRangeTransition?: Transition;
}
export interface TerrainLayerStyleProps {
  /**
   * Exaggerates the elevation of the terrain by multiplying the data from the DEM with this value.
   *
   * @requires source
   */
  exaggeration?: Value<number, ['zoom']>;
}

export type AllLayerStyleProps =
  | FillLayerStyleProps
  | LineLayerStyleProps
  | SymbolLayerStyleProps
  | CircleLayerStyleProps
  | HeatmapLayerStyleProps
  | FillExtrusionLayerStyleProps
  | RasterLayerStyleProps
  | HillshadeLayerStyleProps
  | ModelLayerStyleProps
  | BackgroundLayerStyleProps
  | SkyLayerStyleProps
  | LightLayerStyleProps
  | AtmosphereLayerStyleProps
  | TerrainLayerStyleProps;
