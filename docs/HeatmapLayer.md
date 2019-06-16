## <MapboxGL.HeatmapLayer />
### HeatmapLayer renders a heatmap of provided GeoJSON data based on the provided style.

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

* <a href="#name">visibility</a><br/>
* <a href="#name-1">heatmapColor</a><br/>
* <a href="#name-2">heatmapIntensity</a><br/>
* <a href="#name-3">heatmapOpacity</a><br/>
* <a href="#name-4">heatmapRadius</a><br/>
* <a href="#name-5">heatmapWeight</a><br/>


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
`heatmapColor`

#### Description
The color of the heatmap.

#### Type
`enum`
#### Default Value
`visible`

#### Supported Values
**visible** - The layer is shown.<br />
**none** - The layer is not shown.<br />



___

#### Name
`heatmapIntensity`

#### Description
The intensity of the heatmap. This is a multiplier on top of heatmapWeight.

#### Type
`number`
#### Default Value
`1`


#### Expression

Parameters: `zoom, feature, feature-state`

___

#### Name
`heatmapOpacity`

#### Description
Adjusts opacity of the heatmap layer.

#### Type
`number`
#### Default Value
`1`


#### Expression

Parameters: `zoom, feature, feature-state`

___

#### Name
`heatmapRadius`

#### Description
Adjusts the heatmap radius based on parameters.

#### Type
`number`
#### Default Value
`1`

#### Minimum
`0`

#### Expression

Parameters: `zoom, feature, feature-state`

___

#### Name
`heatmapWeight`

#### Description
Sets the weight of the heatmap based on parameters.

#### Type
`number`
#### Default Value
`1`

#### Minimum
`0`


#### Maximum
`1`

#### Expression

Parameters: `zoom, feature, feature-state`

___

