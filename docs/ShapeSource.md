## <MapboxGL.ShapeSource />
### ShapeSource is a map content source that supplies vector shapes to be shown on the map.<br/>The shape may be a url or a GeoJSON object

### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | :----------: |
| id | `string` | `MapboxGL.StyleSource.DefaultSourceID` | `false` | A string that uniquely identifies the source. |
| url | `string` | `none` | `false` | An HTTP(S) URL, absolute file URL, or local file URL relative to the current application’s resource bundle. |
| shape | `object` | `none` | `false` | The contents of the source. A shape can represent a GeoJSON geometry, a feature, or a feature colllection. |
| cluster | `bool` | `none` | `false` | Enables clustering on the source for point shapes. |
| clusterRadius | `number` | `none` | `false` | Specifies the radius of each cluster if clustering is enabled.<br/>A value of 512 produces a radius equal to the width of a tile.<br/>The default value is 50. |
| clusterMaxZoomLevel | `number` | `none` | `false` | Specifies the maximum zoom level at which to cluster points if clustering is enabled.<br/>Defaults to one zoom level less than the value of maxZoomLevel so that, at the maximum zoom level,<br/>the shapes are not clustered. |
| maxZoomLevel | `number` | `none` | `false` | Specifies the maximum zoom level at which to create vector tiles.<br/>A greater value produces greater detail at high zoom levels.<br/>The default value is 18. |
| buffer | `number` | `none` | `false` | Specifies the size of the tile buffer on each side.<br/>A value of 0 produces no buffer. A value of 512 produces a buffer as wide as the tile itself.<br/>Larger values produce fewer rendering artifacts near tile edges and slower performance.<br/>The default value is 128. |
| tolerance | `number` | `none` | `false` | Specifies the Douglas-Peucker simplification tolerance.<br/>A greater value produces simpler geometries and improves performance.<br/>The default value is 0.375. |
| images | `object` | `none` | `false` | Specifies the external images in key-value pairs required for the shape source.<br/>If you have an asset under Image.xcassets on iOS and the drawables directory on android<br/>you can specify an array of string names with assets as the key `{ assets: ['pin'] }`. |
| onPress | `func` | `none` | `false` | Source press listener, gets called when a user presses one of the children layers only<br/>if that layer has a higher z-index than another source layers |
| hitbox | `shape` | `none` | `false` | Overrides the default touch hitbox(44x44 pixels) for the source layers |


