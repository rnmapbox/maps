## <MapboxGL.SymbolLayer />
### SymbolLayer is a style layer that renders icon and text labels at points or along lines on the map.

### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | :----------: |
| id | `string` | `none` | `false` | A string that uniquely identifies the source in the style to which it is added. |
| sourceID | `string` | `MapboxGL.StyleSource.DefaultSourceID` | `false` | The source from which to obtain the data to style. If the source has not yet been added to the current style, the behavior is undefined. |
| sourceLayerID | `string` | `none` | `false` | Identifier of the layer within the source identified by the sourceID property from which the receiver obtains the data to style. |
| aboveLayerID | `string` | `none` | `false` | Inserts a layer above aboveLayerID. |
| belowLayerID | `string` | `none` | `false` | Inserts a layer below belowLayerID |
| layerIndex | `number` | `none` | `false` | Inserts a layer at a specified index |
| filter | `array` | `none` | `false` | Filter only the features in the source layer that satisfy a condition that you define |
| minZoomLevel | `number` | `none` | `false` | The minimum zoom level at which the layer gets parsed and appears. |
| maxZoomLevel | `number` | `none` | `false` | The maximum zoom level at which the layer gets parsed and appears. |
| style | `union` | `none` | `false` | Customizable style attributes |


### [styles](#SymbolLayer-styles)

* <a href="#symbolPlacement">symbolPlacement</a><br/>
* <a href="#symbolSpacing">symbolSpacing</a><br/>
* <a href="#symbolAvoidEdges">symbolAvoidEdges</a><br/>
* <a href="#iconAllowOverlap">iconAllowOverlap</a><br/>
* <a href="#iconIgnorePlacement">iconIgnorePlacement</a><br/>
* <a href="#iconOptional">iconOptional</a><br/>
* <a href="#iconRotationAlignment">iconRotationAlignment</a><br/>
* <a href="#iconSize">iconSize</a><br/>
* <a href="#iconTextFit">iconTextFit</a><br/>
* <a href="#iconTextFitPadding">iconTextFitPadding</a><br/>
* <a href="#iconImage">iconImage</a><br/>
* <a href="#iconRotate">iconRotate</a><br/>
* <a href="#iconPadding">iconPadding</a><br/>
* <a href="#iconKeepUpright">iconKeepUpright</a><br/>
* <a href="#iconOffset">iconOffset</a><br/>
* <a href="#iconAnchor">iconAnchor</a><br/>
* <a href="#iconPitchAlignment">iconPitchAlignment</a><br/>
* <a href="#textPitchAlignment">textPitchAlignment</a><br/>
* <a href="#textRotationAlignment">textRotationAlignment</a><br/>
* <a href="#textField">textField</a><br/>
* <a href="#textFont">textFont</a><br/>
* <a href="#textSize">textSize</a><br/>
* <a href="#textMaxWidth">textMaxWidth</a><br/>
* <a href="#textLineHeight">textLineHeight</a><br/>
* <a href="#textLetterSpacing">textLetterSpacing</a><br/>
* <a href="#textJustify">textJustify</a><br/>
* <a href="#textAnchor">textAnchor</a><br/>
* <a href="#textMaxAngle">textMaxAngle</a><br/>
* <a href="#textRotate">textRotate</a><br/>
* <a href="#textPadding">textPadding</a><br/>
* <a href="#textKeepUpright">textKeepUpright</a><br/>
* <a href="#textTransform">textTransform</a><br/>
* <a href="#textOffset">textOffset</a><br/>
* <a href="#textAllowOverlap">textAllowOverlap</a><br/>
* <a href="#textIgnorePlacement">textIgnorePlacement</a><br/>
* <a href="#textOptional">textOptional</a><br/>
* <a href="#visibility">visibility</a><br/>
* <a href="#iconOpacity">iconOpacity</a><br/>
* <a href="#iconColor">iconColor</a><br/>
* <a href="#iconHaloColor">iconHaloColor</a><br/>
* <a href="#iconHaloWidth">iconHaloWidth</a><br/>
* <a href="#iconHaloBlur">iconHaloBlur</a><br/>
* <a href="#iconTranslate">iconTranslate</a><br/>
* <a href="#iconTranslateAnchor">iconTranslateAnchor</a><br/>
* <a href="#textOpacity">textOpacity</a><br/>
* <a href="#textColor">textColor</a><br/>
* <a href="#textHaloColor">textHaloColor</a><br/>
* <a href="#textHaloWidth">textHaloWidth</a><br/>
* <a href="#textHaloBlur">textHaloBlur</a><br/>
* <a href="#textTranslate">textTranslate</a><br/>
* <a href="#textTranslateAnchor">textTranslateAnchor</a><br/>

___

#### Name
`symbolPlacement`

#### Description
Label placement relative to its geometry.

#### Type
`enum`
#### Default Value
`point`

#### Supported Values
**point** - The label is placed at the point where the geometry is located.<br />
**line** - The label is placed along the line of the geometry. Can only be used on `LineString` and `Polygon` geometries.<br />


#### Supported Style Functions
`camera`

___

#### Name
`symbolSpacing`

#### Description
Distance between two symbol anchors.

#### Type
`number`
#### Default Value
`250`

#### Units
`pixels`

#### Minimum
`1`


#### Supported Style Functions
`camera`

___

#### Name
`symbolAvoidEdges`

#### Description
If true, the symbols will not cross tile edges to avoid mutual collisions. Recommended in layers that don't have enough padding in the vector tile to prevent collisions, or if it is a point symbol layer placed after a line symbol layer.

#### Type
`boolean`
#### Default Value
`false`


#### Supported Style Functions
`camera`

___

#### Name
`iconAllowOverlap`

#### Description
If true, the icon will be visible even if it collides with other previously drawn symbols.

#### Type
`boolean`
#### Default Value
`false`


#### Requires
`iconImage`

#### Supported Style Functions
`camera`

___

#### Name
`iconIgnorePlacement`

#### Description
If true, other symbols can be visible even if they collide with the icon.

#### Type
`boolean`
#### Default Value
`false`


#### Requires
`iconImage`

#### Supported Style Functions
`camera`

___

#### Name
`iconOptional`

#### Description
If true, text will display without their corresponding icons when the icon collides with other symbols and the text does not.

#### Type
`boolean`
#### Default Value
`false`


#### Requires
`iconImage, textField`

#### Supported Style Functions
`camera`

___

#### Name
`iconRotationAlignment`

#### Description
In combination with `symbolPlacement`, determines the rotation behavior of icons.

#### Type
`enum`
#### Default Value
`auto`

#### Supported Values
**map** - When `symbol-placement` is set to `point`, aligns icons east-west. When `symbol-placement` is set to `line`, aligns icon x-axes with the line.<br />
**viewport** - Produces icons whose x-axes are aligned with the x-axis of the viewport, regardless of the value of `symbol-placement`.<br />
**auto** - When `symbol-placement` is set to `point`, this is equivalent to `viewport`. When `symbol-placement` is set to `line`, this is equivalent to `map`.<br />


#### Requires
`iconImage`

#### Supported Style Functions
`camera`

___

#### Name
`iconSize`

#### Description
Scales the original size of the icon by the provided factor. The new pixel size of the image will be the original pixel size multiplied by `iconSize`. 1 is the original size; 3 triples the size of the image.

#### Type
`number`
#### Default Value
`1`

#### Units
`factor of the original icon size`

#### Minimum
`0`


#### Requires
`iconImage`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`iconTextFit`

#### Description
Scales the icon to fit around the associated text.

#### Type
`enum`
#### Default Value
`none`

#### Supported Values
**none** - The icon is displayed at its intrinsic aspect ratio.<br />
**width** - The icon is scaled in the x-dimension to fit the width of the text.<br />
**height** - The icon is scaled in the y-dimension to fit the height of the text.<br />
**both** - The icon is scaled in both x- and y-dimensions.<br />


#### Requires
`iconImage, textField`

#### Supported Style Functions
`camera`

___

#### Name
`iconTextFitPadding`

#### Description
Size of the additional area added to dimensions determined by `iconTextFit`, in clockwise order: top, right, bottom, left.

#### Type
`array<number>`
#### Default Value
`[0,0,0,0]`

#### Units
`pixels`


#### Requires
`iconImage, textField`

#### Supported Style Functions
`camera`

___

#### Name
`iconImage`

#### Description
Name of image in sprite to use for drawing an image background. A string with `{tokens}` replaced, referencing the data property to pull from. (`{token}` replacement is only supported for literal `iconImage` values; not for property functions.)

#### Type
`string`


#### Supported Style Functions
`camera, source, composite`

___

#### Name
`iconRotate`

#### Description
Rotates the icon clockwise.

#### Type
`number`
#### Default Value
`0`

#### Units
`degrees`


#### Requires
`iconImage`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`iconPadding`

#### Description
Size of the additional area around the icon bounding box used for detecting symbol collisions.

#### Type
`number`
#### Default Value
`2`

#### Units
`pixels`

#### Minimum
`0`


#### Requires
`iconImage`

#### Supported Style Functions
`camera`

___

#### Name
`iconKeepUpright`

#### Description
If true, the icon may be flipped to prevent it from being rendered upsideDown.

#### Type
`boolean`
#### Default Value
`false`


#### Requires
`iconImage`

#### Supported Style Functions
`camera`

___

#### Name
`iconOffset`

#### Description
Offset distance of icon from its anchor. Positive values indicate right and down, while negative values indicate left and up. When combined with `iconRotate` the offset will be as if the rotated direction was up.

#### Type
`array<number>`
#### Default Value
`[0,0]`

#### Units
`pixels multiplied by the value of "icon-size"`


#### Requires
`iconImage`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`iconAnchor`

#### Description
Part of the icon placed closest to the anchor.

#### Type
`enum`
#### Default Value
`center`

#### Supported Values
**center** - The center of the icon is placed closest to the anchor.<br />
**left** - The left side of the icon is placed closest to the anchor.<br />
**right** - The right side of the icon is placed closest to the anchor.<br />
**top** - The top of the icon is placed closest to the anchor.<br />
**bottom** - The bottom of the icon is placed closest to the anchor.<br />
**top-left** - The top left corner of the icon is placed closest to the anchor.<br />
**top-right** - The top right corner of the icon is placed closest to the anchor.<br />
**bottom-left** - The bottom left corner of the icon is placed closest to the anchor.<br />
**bottom-right** - The bottom right corner of the icon is placed closest to the anchor.<br />


#### Requires
`iconImage`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`iconPitchAlignment`

#### Description
Orientation of icon when map is pitched.

#### Type
`enum`
#### Default Value
`auto`

#### Supported Values
**map** - The icon is aligned to the plane of the map.<br />
**viewport** - The icon is aligned to the plane of the viewport.<br />
**auto** - Automatically matches the value of `icon-rotation-alignment`.<br />


#### Requires
`iconImage`

#### Supported Style Functions
`camera`

___

#### Name
`textPitchAlignment`

#### Description
Orientation of text when map is pitched.

#### Type
`enum`
#### Default Value
`auto`

#### Supported Values
**map** - The text is aligned to the plane of the map.<br />
**viewport** - The text is aligned to the plane of the viewport.<br />
**auto** - Automatically matches the value of `text-rotation-alignment`.<br />


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textRotationAlignment`

#### Description
In combination with `symbolPlacement`, determines the rotation behavior of the individual glyphs forming the text.

#### Type
`enum`
#### Default Value
`auto`

#### Supported Values
**map** - When `symbol-placement` is set to `point`, aligns text east-west. When `symbol-placement` is set to `line`, aligns text x-axes with the line.<br />
**viewport** - Produces glyphs whose x-axes are aligned with the x-axis of the viewport, regardless of the value of `symbol-placement`.<br />
**auto** - When `symbol-placement` is set to `point`, this is equivalent to `viewport`. When `symbol-placement` is set to `line`, this is equivalent to `map`.<br />


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textField`

#### Description
Value to use for a text label. Feature properties are specified using tokens like `{field_name}`. (`{token}` replacement is only supported for literal `textField` values; not for property functions.)

#### Type
`string`
#### Default Value
`empty string`


#### Supported Style Functions
`camera, source, composite`

___

#### Name
`textFont`

#### Description
Font stack to use for displaying text.

#### Type
`array<string>`
#### Default Value
`[Open Sans Regular,Arial Unicode MS Regular]`


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textSize`

#### Description
Font size.

#### Type
`number`
#### Default Value
`16`

#### Units
`pixels`

#### Minimum
`0`


#### Requires
`textField`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`textMaxWidth`

#### Description
The maximum line width for text wrapping.

#### Type
`number`
#### Default Value
`10`

#### Units
`ems`

#### Minimum
`0`


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textLineHeight`

#### Description
Text leading value for multiLine text.

#### Type
`number`
#### Default Value
`1.2`

#### Units
`ems`


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textLetterSpacing`

#### Description
Text tracking amount.

#### Type
`number`
#### Default Value
`0`

#### Units
`ems`


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textJustify`

#### Description
Text justification options.

#### Type
`enum`
#### Default Value
`center`

#### Supported Values
**left** - The text is aligned to the left.<br />
**center** - The text is centered.<br />
**right** - The text is aligned to the right.<br />


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textAnchor`

#### Description
Part of the text placed closest to the anchor.

#### Type
`enum`
#### Default Value
`center`

#### Supported Values
**center** - The center of the text is placed closest to the anchor.<br />
**left** - The left side of the text is placed closest to the anchor.<br />
**right** - The right side of the text is placed closest to the anchor.<br />
**top** - The top of the text is placed closest to the anchor.<br />
**bottom** - The bottom of the text is placed closest to the anchor.<br />
**top-left** - The top left corner of the text is placed closest to the anchor.<br />
**top-right** - The top right corner of the text is placed closest to the anchor.<br />
**bottom-left** - The bottom left corner of the text is placed closest to the anchor.<br />
**bottom-right** - The bottom right corner of the text is placed closest to the anchor.<br />


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textMaxAngle`

#### Description
Maximum angle change between adjacent characters.

#### Type
`number`
#### Default Value
`45`

#### Units
`degrees`


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textRotate`

#### Description
Rotates the text clockwise.

#### Type
`number`
#### Default Value
`0`

#### Units
`degrees`


#### Requires
`textField`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`textPadding`

#### Description
Size of the additional area around the text bounding box used for detecting symbol collisions.

#### Type
`number`
#### Default Value
`2`

#### Units
`pixels`

#### Minimum
`0`


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textKeepUpright`

#### Description
If true, the text may be flipped vertically to prevent it from being rendered upsideDown.

#### Type
`boolean`
#### Default Value
`true`


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textTransform`

#### Description
Specifies how to capitalize text, similar to the CSS `textTransform` property.

#### Type
`enum`
#### Default Value
`none`

#### Supported Values
**none** - The text is not altered.<br />
**uppercase** - Forces all letters to be displayed in uppercase.<br />
**lowercase** - Forces all letters to be displayed in lowercase.<br />


#### Requires
`textField`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`textOffset`

#### Description
Offset distance of text from its anchor. Positive values indicate right and down, while negative values indicate left and up.

#### Type
`array<number>`
#### Default Value
`[0,0]`

#### Units
`ems`


#### Requires
`textField`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`textAllowOverlap`

#### Description
If true, the text will be visible even if it collides with other previously drawn symbols.

#### Type
`boolean`
#### Default Value
`false`


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textIgnorePlacement`

#### Description
If true, other symbols can be visible even if they collide with the text.

#### Type
`boolean`
#### Default Value
`false`


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textOptional`

#### Description
If true, icons will display without their corresponding text when the text collides with other symbols and the icon does not.

#### Type
`boolean`
#### Default Value
`false`


#### Requires
`textField, iconImage`

#### Supported Style Functions
`camera`

___

#### Name
`visibility`

#### Description
Whether this layer is displayed.

#### Type
`enum`
#### Default Value
`visible`

#### Supported Values
**visible** - The layer is shown.<br />
**none** - The layer is not shown.<br />



___

#### Name
`iconOpacity`

#### Description
The opacity at which the icon will be drawn.

#### Type
`number`
#### Default Value
`1`

#### Minimum
`0`


#### Maximum
`1`

#### Requires
`iconImage`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`iconColor`

#### Description
The color of the icon. This can only be used with sdf icons.

#### Type
`color`
#### Default Value
`#000000`


#### Requires
`iconImage`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`iconHaloColor`

#### Description
The color of the icon's halo. Icon halos can only be used with SDF icons.

#### Type
`color`
#### Default Value
`rgba(0, 0, 0, 0)`


#### Requires
`iconImage`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`iconHaloWidth`

#### Description
Distance of halo to the icon outline.

#### Type
`number`
#### Default Value
`0`

#### Units
`pixels`

#### Minimum
`0`


#### Requires
`iconImage`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`iconHaloBlur`

#### Description
Fade out the halo towards the outside.

#### Type
`number`
#### Default Value
`0`

#### Units
`pixels`

#### Minimum
`0`


#### Requires
`iconImage`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`iconTranslate`

#### Description
Distance that the icon's anchor is moved from its original placement. Positive values indicate right and down, while negative values indicate left and up.

#### Type
`array<number>`
#### Default Value
`[0,0]`

#### Units
`pixels`


#### Requires
`iconImage`

#### Supported Style Functions
`camera`

___

#### Name
`iconTranslateAnchor`

#### Description
Controls the frame of reference for `iconTranslate`.

#### Type
`enum`
#### Default Value
`map`

#### Supported Values
**map** - Icons are translated relative to the map.<br />
**viewport** - Icons are translated relative to the viewport.<br />


#### Requires
`iconImage, iconTranslate`

#### Supported Style Functions
`camera`

___

#### Name
`textOpacity`

#### Description
The opacity at which the text will be drawn.

#### Type
`number`
#### Default Value
`1`

#### Minimum
`0`


#### Maximum
`1`

#### Requires
`textField`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`textColor`

#### Description
The color with which the text will be drawn.

#### Type
`color`
#### Default Value
`#000000`


#### Requires
`textField`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`textHaloColor`

#### Description
The color of the text's halo, which helps it stand out from backgrounds.

#### Type
`color`
#### Default Value
`rgba(0, 0, 0, 0)`


#### Requires
`textField`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`textHaloWidth`

#### Description
Distance of halo to the font outline. Max text halo width is 1/4 of the fontSize.

#### Type
`number`
#### Default Value
`0`

#### Units
`pixels`

#### Minimum
`0`


#### Requires
`textField`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`textHaloBlur`

#### Description
The halo's fadeout distance towards the outside.

#### Type
`number`
#### Default Value
`0`

#### Units
`pixels`

#### Minimum
`0`


#### Requires
`textField`

#### Supported Style Functions
`camera, source, composite`

___

#### Name
`textTranslate`

#### Description
Distance that the text's anchor is moved from its original placement. Positive values indicate right and down, while negative values indicate left and up.

#### Type
`array<number>`
#### Default Value
`[0,0]`

#### Units
`pixels`


#### Requires
`textField`

#### Supported Style Functions
`camera`

___

#### Name
`textTranslateAnchor`

#### Description
Controls the frame of reference for `textTranslate`.

#### Type
`enum`
#### Default Value
`map`

#### Supported Values
**map** - The text is translated relative to the map.<br />
**viewport** - The text is translated relative to the viewport.<br />


#### Requires
`textField, textTranslate`

#### Supported Style Functions
`camera`

