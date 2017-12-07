## <MapboxGL.FillLayer />
### FillLayer is a style layer that renders one or more filled (and optionally stroked) polygons on the map.

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
| `visibility` | `enum` | `none` | `none` | Whether this layer is displayed. |
| `fillAntialias` | `boolean` | `none` | `none` | Whether or not the fill should be antialiased. |
| `fillOpacity` | `number` | `none` | `none` | The opacity of the entire fill layer. In contrast to the `fillColor`, this value will also affect the 1px stroke around the fill, if the stroke is used. |
| `fillColor` | `color` | `none` | `fillPattern` | The color of the filled part of this layer. This color can be specified as `rgba` with an alpha component and the color's opacity will not affect the opacity of the 1px stroke, if it is used. |
| `fillOutlineColor` | `color` | `none` | `fillPattern` | The outline color of the fill. Matches the value of `fillColor` if unspecified. |
| `fillTranslate` | `array` | `none` | `none` | The geometry's offset. Values are [x, y] where negatives indicate left and up, respectively. |
| `fillTranslateAnchor` | `enum` | `fillTranslate` | `none` | Controls the frame of reference for `fillTranslate`. |
| `fillPattern` | `string` | `none` | `none` | Name of image in sprite to use for drawing image fills. For seamless patterns, image width and height must be a factor of two (2, 4, 8, ..., 512). |
