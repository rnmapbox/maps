## <MapboxGL.RasterLayer />
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
| `rasterOpacity` | `number` | `none` | `none` | The opacity at which the image will be drawn. |
| `rasterHueRotate` | `number` | `none` | `none` | Rotates hues around the color wheel. |
| `rasterBrightnessMin` | `number` | `none` | `none` | Increase or reduce the brightness of the image. The value is the minimum brightness. |
| `rasterBrightnessMax` | `number` | `none` | `none` | Increase or reduce the brightness of the image. The value is the maximum brightness. |
| `rasterSaturation` | `number` | `none` | `none` | Increase or reduce the saturation of the image. |
| `rasterContrast` | `number` | `none` | `none` | Increase or reduce the contrast of the image. |
| `rasterFadeDuration` | `number` | `none` | `none` | Fade duration when a new tile is added. |
