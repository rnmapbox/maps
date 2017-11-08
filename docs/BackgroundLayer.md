## <MapboxGL.BackgroundLayer />
### 

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
| `backgroundColor` | `color` | `none` | `backgroundPattern` | The color with which the background will be drawn. |
| `backgroundPattern` | `string` | `none` | `none` | Name of image in sprite to use for drawing an image background. For seamless patterns, image width and height must be a factor of two (2, 4, 8, ..., 512). |
| `backgroundOpacity` | `number` | `none` | `none` | The opacity at which the background will be drawn. |
