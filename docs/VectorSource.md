## <MapboxGL.VectorSource />
### VectorSource is a map content source that supplies tiled vector data in Mapbox Vector Tile format to be shown on the map.<br/>The location of and metadata about the tiles are defined either by an option dictionary or by an external file that conforms to the TileJSON specification.

### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | :----------: |
| id | `string` | `MapboxGL.StyleSource.DefaultSourceID` | `false` | A string that uniquely identifies the source. |
| url | `string` | `none` | `false` | A URL to a TileJSON configuration file describing the source’s contents and other metadata. |
| onPress | `func` | `none` | `false` | Source press listener, gets called when a user presses one of the children layers only<br/>if that layer has a higher z-index than another source layers |
| hitbox | `shape` | `none` | `false` | Overrides the default touch hitbox(44x44 pixels) for the source layers |
| &nbsp;&nbsp;width | `number` | `none` | `true` | FIX ME NO DESCRIPTION |
| &nbsp;&nbsp;height | `number` | `none` | `true` | FIX ME NO DESCRIPTION |

### methods
#### features([layerIDs][, filter])

Returns all features that match the query parameters regardless of whether or not the feature is<br/>currently rendered on the map. The domain of the query includes all currently-loaded vector tiles<br/>and GeoJSON source tiles. This function does not check tiles outside of the visible viewport.

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `layerIDs` | `Array` | `No` | A set of strings that correspond to the names of layers defined in the current style. Only the features contained in these layers are included in the returned array. |
| `filter` | `Array` | `No` | an optional filter statement to filter the returned Features. |



```javascript
vectorSource.features(['id1', 'id2'])
```



