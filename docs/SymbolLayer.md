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
| style | `custom` | `none` | `false` | Customizable style attributes |


### styles
| Name | Type | Requires | Disabled By |  Description |
| ---- | :--: | :------: | :---------: | :----------: |
| `symbolPlacement` | `enum` | `none` | `none` | Label placement relative to its geometry. |
| `symbolSpacing` | `number` | `none` | `none` | Distance between two symbol anchors. |
| `symbolAvoidEdges` | `boolean` | `none` | `none` | If true, the symbols will not cross tile edges to avoid mutual collisions. Recommended in layers that don't have enough padding in the vector tile to prevent collisions, or if it is a point symbol layer placed after a line symbol layer. |
| `iconAllowOverlap` | `boolean` | `icon-image` | `none` | If true, the icon will be visible even if it collides with other previously drawn symbols. |
| `iconIgnorePlacement` | `boolean` | `icon-image` | `none` | If true, other symbols can be visible even if they collide with the icon. |
| `iconOptional` | `boolean` | `icon-image, text-field` | `none` | If true, text will display without their corresponding icons when the icon collides with other symbols and the text does not. |
| `iconRotationAlignment` | `enum` | `icon-image` | `none` | In combination with `symbol-placement`, determines the rotation behavior of icons. |
| `iconSize` | `number` | `icon-image` | `none` | Scales the original size of the icon by the provided factor. The new pixel size of the image will be the original pixel size multiplied by `icon-size`. 1 is the original size; 3 triples the size of the image. |
| `iconTextFit` | `enum` | `icon-image, text-field` | `none` | Scales the icon to fit around the associated text. |
| `iconTextFitPadding` | `array` | `icon-image, text-field` | `none` | Size of the additional area added to dimensions determined by `icon-text-fit`, in clockwise order: top, right, bottom, left. |
| `iconImage` | `string` | `none` | `none` | Name of image in sprite to use for drawing an image background. A string with {tokens} replaced, referencing the data property to pull from. |
| `iconRotate` | `number` | `icon-image` | `none` | Rotates the icon clockwise. |
| `iconPadding` | `number` | `icon-image` | `none` | Size of the additional area around the icon bounding box used for detecting symbol collisions. |
| `iconKeepUpright` | `boolean` | `icon-image` | `none` | If true, the icon may be flipped to prevent it from being rendered upside-down. |
| `iconOffset` | `array` | `icon-image` | `none` | Offset distance of icon from its anchor. Positive values indicate right and down, while negative values indicate left and up. When combined with `icon-rotate` the offset will be as if the rotated direction was up. |
| `textPitchAlignment` | `enum` | `text-field` | `none` | Orientation of text when map is pitched. |
| `textRotationAlignment` | `enum` | `text-field` | `none` | In combination with `symbol-placement`, determines the rotation behavior of the individual glyphs forming the text. |
| `textField` | `string` | `none` | `none` | Value to use for a text label. Feature properties are specified using tokens like {field_name}.  (Token replacement is only supported for literal `text-field` values--not for property functions.) |
| `textFont` | `array` | `text-field` | `none` | Font stack to use for displaying text. |
| `textSize` | `number` | `text-field` | `none` | Font size. |
| `textMaxWidth` | `number` | `text-field` | `none` | The maximum line width for text wrapping. |
| `textLineHeight` | `number` | `text-field` | `none` | Text leading value for multi-line text. |
| `textLetterSpacing` | `number` | `text-field` | `none` | Text tracking amount. |
| `textJustify` | `enum` | `text-field` | `none` | Text justification options. |
| `textAnchor` | `enum` | `text-field` | `none` | Part of the text placed closest to the anchor. |
| `textMaxAngle` | `number` | `text-field` | `none` | Maximum angle change between adjacent characters. |
| `textRotate` | `number` | `text-field` | `none` | Rotates the text clockwise. |
| `textPadding` | `number` | `text-field` | `none` | Size of the additional area around the text bounding box used for detecting symbol collisions. |
| `textKeepUpright` | `boolean` | `text-field` | `none` | If true, the text may be flipped vertically to prevent it from being rendered upside-down. |
| `textTransform` | `enum` | `text-field` | `none` | Specifies how to capitalize text, similar to the CSS `text-transform` property. |
| `textOffset` | `array` | `text-field` | `none` | Offset distance of text from its anchor. Positive values indicate right and down, while negative values indicate left and up. |
| `textAllowOverlap` | `boolean` | `text-field` | `none` | If true, the text will be visible even if it collides with other previously drawn symbols. |
| `textIgnorePlacement` | `boolean` | `text-field` | `none` | If true, other symbols can be visible even if they collide with the text. |
| `textOptional` | `boolean` | `text-field, icon-image` | `none` | If true, icons will display without their corresponding text when the text collides with other symbols and the icon does not. |
| `visibility` | `enum` | `none` | `none` | Whether this layer is displayed. |
| `iconOpacity` | `number` | `icon-image` | `none` | The opacity at which the icon will be drawn. |
| `iconColor` | `color` | `icon-image` | `none` | The color of the icon. This can only be used with sdf icons. |
| `iconHaloColor` | `color` | `icon-image` | `none` | The color of the icon's halo. Icon halos can only be used with SDF icons. |
| `iconHaloWidth` | `number` | `icon-image` | `none` | Distance of halo to the icon outline. |
| `iconHaloBlur` | `number` | `icon-image` | `none` | Fade out the halo towards the outside. |
| `iconTranslate` | `array` | `icon-image` | `none` | Distance that the icon's anchor is moved from its original placement. Positive values indicate right and down, while negative values indicate left and up. |
| `iconTranslateAnchor` | `enum` | `icon-image, icon-translate` | `none` | Controls the translation reference point. |
| `textOpacity` | `number` | `text-field` | `none` | The opacity at which the text will be drawn. |
| `textColor` | `color` | `text-field` | `none` | The color with which the text will be drawn. |
| `textHaloColor` | `color` | `text-field` | `none` | The color of the text's halo, which helps it stand out from backgrounds. |
| `textHaloWidth` | `number` | `text-field` | `none` | Distance of halo to the font outline. Max text halo width is 1/4 of the font-size. |
| `textHaloBlur` | `number` | `text-field` | `none` | The halo's fadeout distance towards the outside. |
| `textTranslate` | `array` | `text-field` | `none` | Distance that the text's anchor is moved from its original placement. Positive values indicate right and down, while negative values indicate left and up. |
| `textTranslateAnchor` | `enum` | `text-field, text-translate` | `none` | Controls the translation reference point. |
