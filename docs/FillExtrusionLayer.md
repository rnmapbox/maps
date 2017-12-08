## <MapboxGL.FillExtrusionLayer />
### FillExtrusionLayer is a style layer that renders one or more 3D extruded polygons on the map.

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
| `fillExtrusionOpacity` | `number` | `none` | `none` | The opacity of the entire fill extrusion layer. This is rendered on a perLayer, not perFeature, basis, and dataDriven styling is not available. |
| `fillExtrusionColor` | `color` | `none` | `fillExtrusionPattern` | The base color of the extruded fill. The extrusion's surfaces will be shaded differently based on this color in combination with the root `light` settings. If this color is specified as `rgba` with an alpha component, the alpha component will be ignored; use `fillExtrusionOpacity` to set layer opacity. |
| `fillExtrusionTranslate` | `array` | `none` | `none` | The geometry's offset. Values are [x, y] where negatives indicate left and up (on the flat plane), respectively. |
| `fillExtrusionTranslateAnchor` | `enum` | `fillExtrusionTranslate` | `none` | Controls the frame of reference for `fillExtrusionTranslate`. |
| `fillExtrusionPattern` | `string` | `none` | `none` | Name of image in sprite to use for drawing images on extruded fills. For seamless patterns, image width and height must be a factor of two (2, 4, 8, ..., 512). |
| `fillExtrusionHeight` | `number` | `none` | `none` | The height with which to extrude this layer. |
| `fillExtrusionBase` | `number` | `fillExtrusionHeight` | `none` | The height with which to extrude the base of this layer. Must be less than or equal to `fillExtrusionHeight`. |
