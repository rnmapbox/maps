## <MapboxGL.LineLayer />
### LineLayer is a style layer that renders one or more stroked polylines on the map.

### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | :----------: |
| id | `string` | `none` | `false` | A string that uniquely identifies the source in the style to which it is added. |
| sourceID | `string` | `MapboxGL.StyleSource.DefaultSourceID` | `false` | The source from which to obtain the data to style.<br/>If the source has not yet been added to the current style, the behavior is undefined. |
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
| `lineCap` | `enum` | `none` | `none` | The display of line endings. |
| `lineJoin` | `enum` | `none` | `none` | The display of lines when joining. |
| `lineMiterLimit` | `number` | `none` | `none` | Used to automatically convert miter joins to bevel joins for sharp angles. |
| `lineRoundLimit` | `number` | `none` | `none` | Used to automatically convert round joins to miter joins for shallow angles. |
| `visibility` | `enum` | `none` | `none` | Whether this layer is displayed. |
| `lineOpacity` | `number` | `none` | `none` | The opacity at which the line will be drawn. |
| `lineColor` | `color` | `none` | `linePattern` | The color with which the line will be drawn. |
| `lineTranslate` | `array` | `none` | `none` | The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively. |
| `lineTranslateAnchor` | `enum` | `lineTranslate` | `none` | Controls the frame of reference for `lineTranslate`. |
| `lineWidth` | `number` | `none` | `none` | Stroke thickness. |
| `lineGapWidth` | `number` | `none` | `none` | Draws a line casing outside of a line's actual path. Value indicates the width of the inner gap. |
| `lineOffset` | `number` | `none` | `none` | The line's offset. For linear features, a positive value offsets the line to the right, relative to the direction of the line, and a negative value to the left. For polygon features, a positive value results in an inset, and a negative value results in an outset. |
| `lineBlur` | `number` | `none` | `none` | Blur applied to the line, in pixels. |
| `lineDasharray` | `array` | `none` | `linePattern` | Specifies the lengths of the alternating dashes and gaps that form the dash pattern. The lengths are later scaled by the line width. To convert a dash length to pixels, multiply the length by the current line width. |
| `linePattern` | `string` | `none` | `none` | Name of image in sprite to use for drawing image lines. For seamless patterns, image width must be a factor of two (2, 4, 8, ..., 512). |
