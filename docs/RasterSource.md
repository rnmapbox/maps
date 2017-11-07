## <MapboxGL.RasterSource />
### RasterSource is a map content source that supplies raster image tiles to be shown on the map.<br/>The location of and metadata about the tiles are defined either by an option dictionary<br/>or by an external file that conforms to the TileJSON specification.

### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | :----------: |
| id | `string` | `MapboxGL.StyleSource.DefaultSourceID` | `false` | A string that uniquely identifies the source. |
| url | `string` | `none` | `false` | A URL to a TileJSON configuration file describing the source’s contents and other metadata. |
| minZoomLevel | `number` | `none` | `false` | An unsigned integer that specifies the minimum zoom level at which to display tiles from the source.<br/>The value should be between 0 and 22, inclusive, and less than<br/>maxZoomLevel, if specified. The default value for this option is 0. |
| maxZoomLevel | `number` | `none` | `false` | An unsigned integer that specifies the maximum zoom level at which to display tiles from the source.<br/>The value should be between 0 and 22, inclusive, and less than<br/>minZoomLevel, if specified. The default value for this option is 22. |
| tileSize | `number` | `none` | `false` | Size of the map tiles.<br/>Mapbox urls default to 256, all others default to 512. |
| tms | `bool` | `none` | `false` | Influences the y direction of the tile coordinates. (tms inverts y axis) |
| attribution | `string` | `none` | `false` | An HTML or literal text string defining the buttons to be displayed in an action sheet when the<br/>source is part of a map view’s style and the map view’s attribution button is pressed. |


