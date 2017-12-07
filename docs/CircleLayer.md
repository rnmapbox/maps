## <MapboxGL.CircleLayer />
### CircleLayer is a style layer that renders one or more filled circles on the map.

### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | :----------: |
| id | `string` | `none` | `false` | A string that uniquely identifies the source in the style to which it is added. |
| sourceID | `string` | `MapboxGL.StyleSource.DefaultSourceID` | `false` | The source from which to obtain the data to style.<br/>If the source has not yet been added to the current style, the behavior is undefined. |
| sourceLayerID | `string` | `none` | `false` | Identifier of the layer within the source identified by the sourceID property<br/>from which the receiver obtains the data to style. |
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
| `visibility` | `enum` | `none` | `none` | Whether this layer is displayed. |
| `circleRadius` | `number` | `none` | `none` | Circle radius. |
| `circleColor` | `color` | `none` | `none` | The fill color of the circle. |
| `circleBlur` | `number` | `none` | `none` | Amount to blur the circle. 1 blurs the circle such that only the centerpoint is full opacity. |
| `circleOpacity` | `number` | `none` | `none` | The opacity at which the circle will be drawn. |
| `circleTranslate` | `array` | `none` | `none` | The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively. |
| `circleTranslateAnchor` | `enum` | `circleTranslate` | `none` | Controls the frame of reference for `circleTranslate`. |
| `circlePitchScale` | `enum` | `none` | `none` | Controls the scaling behavior of the circle when the map is pitched. |
| `circlePitchAlignment` | `enum` | `none` | `none` | Orientation of circle when map is pitched. |
| `circleStrokeWidth` | `number` | `none` | `none` | The width of the circle's stroke. Strokes are placed outside of the `circleRadius`. |
| `circleStrokeColor` | `color` | `none` | `none` | The stroke color of the circle. |
| `circleStrokeOpacity` | `number` | `none` | `none` | The opacity of the circle's stroke. |
