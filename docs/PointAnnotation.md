## <MapboxGL.PointAnnotation />
### PointAnnotation represents a one-dimensional shape located at a single geographical coordinate.

### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | :----------: |
| id | `string` | `none` | `true` | A string that uniquely identifies the annotation |
| title | `string` | `none` | `false` | The string containing the annotation’s title. Note this is required to be set if you want to see a callout appear on iOS. |
| snippet | `string` | `none` | `false` | The string containing the annotation’s snippet(subtitle). Not displayed in the default callout. |
| selected | `bool` | `none` | `false` | Manually selects/deselects annotation<br/>@type {[type]} |
| coordinate | `arrayOf` | `none` | `true` | The center point (specified as a map coordinate) of the annotation. |
| anchor | `shape` | `{ x: 0.5, y: 0.5 }` | `false` | Specifies the anchor being set on a particular point of the annotation.<br/>The anchor point is specified in the continuous space [0.0, 1.0] x [0.0, 1.0],<br/>where (0, 0) is the top-left corner of the image, and (1, 1) is the bottom-right corner.<br/>Note this is only for custom annotations not the default pin view.<br/>Defaults to the center of the view. |
| onSelected | `func` | `none` | `false` | This callback is fired once this annotation is selected. Returns a Feature as the first param. |
| onDeselected | `func` | `none` | `false` | This callback is fired once this annotation is deselected. |


