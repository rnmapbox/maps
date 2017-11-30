## <MapboxGL.ImageSource />
### ImageSource is a content source that is used for a georeferenced raster image to be shown on the map.<br/>The georeferenced image scales and rotates as the user zooms and rotates the map

### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | :----------: |
| id | `string` | `none` | `false` | A string that uniquely identifies the source. |
| url | `union` | `none` | `false` | An HTTP(S) URL, absolute file URL, or local file URL to the source image.<br/>Gifs are currently not supported. |
| coordinates | `arrayOf` | `none` | `true` | The top left, top right, bottom right, and bottom left coordinates for the image. |


