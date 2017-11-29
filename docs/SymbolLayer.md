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


### styles
| Name | Type | Requires | Disabled By |  Description |
| ---- | :--: | :------: | :---------: | :----------: |
| `symbolPlacement` | `enum` | `none` | `none` | Label placement relative to its geometry. |
| `symbolSpacing` | `number` | `none` | `none` | Distance between two symbol anchors. |
| `symbolAvoidEdges` | `boolean` | `none` | `none` | If true, the symbols will not cross tile edges to avoid mutual collisions. Recommended in layers that don't have enough padding in the vector tile to prevent collisions, or if it is a point symbol layer placed after a line symbol layer. |
| `iconAllowOverlap` | `boolean` | `iconImage` | `none` | If true, the icon will be visible even if it collides with other previously drawn symbols. |
| `iconIgnorePlacement` | `boolean` | `iconImage` | `none` | If true, other symbols can be visible even if they collide with the icon. |
| `iconOptional` | `boolean` | `iconImage, textField` | `none` | If true, text will display without their corresponding icons when the icon collides with other symbols and the text does not. |
| `iconRotationAlignment` | `enum` | `iconImage` | `none` | In combination with `symbolPlacement`, determines the rotation behavior of icons. |
| `iconSize` | `number` | `iconImage` | `none` | Scales the original size of the icon by the provided factor. The new pixel size of the image will be the original pixel size multiplied by `iconSize`. 1 is the original size; 3 triples the size of the image. |
| `iconTextFit` | `enum` | `iconImage, textField` | `none` | Scales the icon to fit around the associated text. |
| `iconTextFitPadding` | `array` | `iconImage, textField` | `none` | Size of the additional area added to dimensions determined by `iconTextFit`, in clockwise order: top, right, bottom, left. |
| `iconImage` | `string` | `none` | `none` | Name of image in sprite to use for drawing an image background. A string with `{tokens}` replaced, referencing the data property to pull from. (`{token}` replacement is only supported for literal `iconImage` values; not for property functions.) |
| `iconRotate` | `number` | `iconImage` | `none` | Rotates the icon clockwise. |
| `iconPadding` | `number` | `iconImage` | `none` | Size of the additional area around the icon bounding box used for detecting symbol collisions. |
| `iconKeepUpright` | `boolean` | `iconImage` | `none` | If true, the icon may be flipped to prevent it from being rendered upsideDown. |
| `iconOffset` | `array` | `iconImage` | `none` | Offset distance of icon from its anchor. Positive values indicate right and down, while negative values indicate left and up. When combined with `iconRotate` the offset will be as if the rotated direction was up. |
| `iconAnchor` | `enum` | `iconImage` | `none` | Part of the icon placed closest to the anchor. |
| `iconPitchAlignment` | `enum` | `iconImage` | `none` | Orientation of icon when map is pitched. |
| `textPitchAlignment` | `enum` | `textField` | `none` | Orientation of text when map is pitched. |
| `textRotationAlignment` | `enum` | `textField` | `none` | In combination with `symbolPlacement`, determines the rotation behavior of the individual glyphs forming the text. |
| `textField` | `string` | `none` | `none` | Value to use for a text label. Feature properties are specified using tokens like `{field_name}`. (`{token}` replacement is only supported for literal `textField` values; not for property functions.) |
| `textFont` | `array` | `textField` | `none` | Font stack to use for displaying text. |
| `textSize` | `number` | `textField` | `none` | Font size. |
| `textMaxWidth` | `number` | `textField` | `none` | The maximum line width for text wrapping. |
| `textLineHeight` | `number` | `textField` | `none` | Text leading value for multiLine text. |
| `textLetterSpacing` | `number` | `textField` | `none` | Text tracking amount. |
| `textJustify` | `enum` | `textField` | `none` | Text justification options. |
| `textAnchor` | `enum` | `textField` | `none` | Part of the text placed closest to the anchor. |
| `textMaxAngle` | `number` | `textField` | `none` | Maximum angle change between adjacent characters. |
| `textRotate` | `number` | `textField` | `none` | Rotates the text clockwise. |
| `textPadding` | `number` | `textField` | `none` | Size of the additional area around the text bounding box used for detecting symbol collisions. |
| `textKeepUpright` | `boolean` | `textField` | `none` | If true, the text may be flipped vertically to prevent it from being rendered upsideDown. |
| `textTransform` | `enum` | `textField` | `none` | Specifies how to capitalize text, similar to the CSS `textTransform` property. |
| `textOffset` | `array` | `textField` | `none` | Offset distance of text from its anchor. Positive values indicate right and down, while negative values indicate left and up. |
| `textAllowOverlap` | `boolean` | `textField` | `none` | If true, the text will be visible even if it collides with other previously drawn symbols. |
| `textIgnorePlacement` | `boolean` | `textField` | `none` | If true, other symbols can be visible even if they collide with the text. |
| `textOptional` | `boolean` | `textField, iconImage` | `none` | If true, icons will display without their corresponding text when the text collides with other symbols and the icon does not. |
| `visibility` | `enum` | `none` | `none` | Whether this layer is displayed. |
| `iconOpacity` | `number` | `iconImage` | `none` | The opacity at which the icon will be drawn. |
| `iconColor` | `color` | `iconImage` | `none` | The color of the icon. This can only be used with sdf icons. |
| `iconHaloColor` | `color` | `iconImage` | `none` | The color of the icon's halo. Icon halos can only be used with SDF icons. |
| `iconHaloWidth` | `number` | `iconImage` | `none` | Distance of halo to the icon outline. |
| `iconHaloBlur` | `number` | `iconImage` | `none` | Fade out the halo towards the outside. |
| `iconTranslate` | `array` | `iconImage` | `none` | Distance that the icon's anchor is moved from its original placement. Positive values indicate right and down, while negative values indicate left and up. |
| `iconTranslateAnchor` | `enum` | `iconImage, iconTranslate` | `none` | Controls the frame of reference for `iconTranslate`. |
| `textOpacity` | `number` | `textField` | `none` | The opacity at which the text will be drawn. |
| `textColor` | `color` | `textField` | `none` | The color with which the text will be drawn. |
| `textHaloColor` | `color` | `textField` | `none` | The color of the text's halo, which helps it stand out from backgrounds. |
| `textHaloWidth` | `number` | `textField` | `none` | Distance of halo to the font outline. Max text halo width is 1/4 of the fontSize. |
| `textHaloBlur` | `number` | `textField` | `none` | The halo's fadeout distance towards the outside. |
| `textTranslate` | `array` | `textField` | `none` | Distance that the text's anchor is moved from its original placement. Positive values indicate right and down, while negative values indicate left and up. |
| `textTranslateAnchor` | `enum` | `textField, textTranslate` | `none` | Controls the frame of reference for `textTranslate`. |
