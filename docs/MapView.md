## <MapboxGL.MapView />
### MapView backed by Mapbox Native GL
    

#### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | ----------: |
| animated | `bool` | `true` | `false` | Animates changes between pitch and bearing |
| centerCoordinate | `object` | `{  type: 'Point',  coordinates: [-77.036086, 38.910233],}` | `false` | Initial center coordinate on map |
| heading | `number` | `0` | `false` | Initial heading on map |
| pitch | `number` | `0` | `false` | Initial pitch on map |
| style | `any` | `none` | `false` | Style for wrapping React Native View |
| styleURL | `string` | `MapView.StyleURL.Street` | `false` | Style URL for map |
| zoomLevel | `number` | `16` | `false` | Initial zoom level of map |
| onPress | `func` | `none` | `false` | Map press listener, gets called when a user presses the map |
| onLongPress | `func` | `none` | `false` | Map long press listener, gets called when a user long presses the map |

    