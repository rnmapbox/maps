## <MapboxGL.Camera />
### 

### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | :----------: |
| animationDuration | `number` | `2000` | `false` | FIX ME NO DESCRIPTION |
| animationMode | `enum` | `'easeTo'` | `false` | FIX ME NO DESCRIPTION |
| defaultSettings | `shape` | `none` | `false` | FIX ME NO DESCRIPTION |
| &nbsp;&nbsp;centerCoordinate | `array` | `none` | `false` | Center coordinate on map [lng, lat] |
| &nbsp;&nbsp;heading | `number` | `none` | `false` | Heading on map |
| &nbsp;&nbsp;pitch | `number` | `none` | `false` | Pitch on map |
| &nbsp;&nbsp;bounds | `shape` | `none` | `false` | FIX ME NO DESCRIPTION |
| &nbsp;&nbsp;&nbsp;&nbsp;ne | `array` | `none` | `true` | northEastCoordinates - North east coordinate of bound |
| &nbsp;&nbsp;&nbsp;&nbsp;sw | `array` | `none` | `true` | southWestCoordinates - North east coordinate of bound |
| &nbsp;&nbsp;&nbsp;&nbsp;paddingLeft | `number` | `none` | `false` | Left camera padding for bounds |
| &nbsp;&nbsp;&nbsp;&nbsp;paddingRight | `number` | `none` | `false` | Right camera padding for bounds |
| &nbsp;&nbsp;&nbsp;&nbsp;paddingTop | `number` | `none` | `false` | Top camera padding for bounds |
| &nbsp;&nbsp;&nbsp;&nbsp;paddingBottom | `number` | `none` | `false` | Bottom camera padding for bounds |
| &nbsp;&nbsp;zoomLevel | `number` | `none` | `false` | Zoom level of the map |
| centerCoordinate | `array` | `none` | `false` | Center coordinate on map [lng, lat] |
| heading | `number` | `none` | `false` | Heading on map |
| pitch | `number` | `none` | `false` | Pitch on map |
| bounds | `shape` | `none` | `false` | FIX ME NO DESCRIPTION |
| &nbsp;&nbsp;ne | `array` | `none` | `true` | northEastCoordinates - North east coordinate of bound |
| &nbsp;&nbsp;sw | `array` | `none` | `true` | southWestCoordinates - North east coordinate of bound |
| &nbsp;&nbsp;paddingLeft | `number` | `none` | `false` | Left camera padding for bounds |
| &nbsp;&nbsp;paddingRight | `number` | `none` | `false` | Right camera padding for bounds |
| &nbsp;&nbsp;paddingTop | `number` | `none` | `false` | Top camera padding for bounds |
| &nbsp;&nbsp;paddingBottom | `number` | `none` | `false` | Bottom camera padding for bounds |
| zoomLevel | `number` | `none` | `false` | Zoom level of the map |
| minZoomLevel | `number` | `none` | `false` | FIX ME NO DESCRIPTION |
| maxZoomLevel | `number` | `none` | `false` | FIX ME NO DESCRIPTION |
| followUserLocation | `bool` | `none` | `false` | FIX ME NO DESCRIPTION |
| followUserMode | `enum` | `none` | `false` | FIX ME NO DESCRIPTION |
| followZoomLevel | `number` | `none` | `false` | FIX ME NO DESCRIPTION |
| followPitch | `number` | `none` | `false` | FIX ME NO DESCRIPTION |
| followHeading | `number` | `none` | `false` | FIX ME NO DESCRIPTION |
| triggerKey | `any` | `none` | `false` | FIX ME NO DESCRIPTION |
| alignment | `array` | `none` | `false` | FIX ME NO DESCRIPTION |
| isUserInteraction | `FIX ME UNKNOWN TYPE` | `false` | `false` | FIX ME NO DESCRIPTION |

### methods
#### fitBounds(northEastCoordinates, southWestCoordinates[, padding][, animationDuration])

Map camera transitions to fit provided bounds

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `northEastCoordinates` | `Array` | `Yes` | North east coordinate of bound |
| `southWestCoordinates` | `Array` | `Yes` | South west coordinate of bound |
| `padding` | `Number` | `No` | Camera padding for bound |
| `animationDuration` | `Number` | `No` | Duration of camera animation |



```javascript
this.camera.fitBounds([lng, lat], [lng, lat])
this.camera.fitBounds([lng, lat], [lng, lat], 20, 1000) // padding for all sides
this.camera.fitBounds([lng, lat], [lng, lat], [verticalPadding, horizontalPadding], 1000)
this.camera.fitBounds([lng, lat], [lng, lat], [top, right, bottom, left], 1000)
```


#### flyTo(coordinates[, animationDuration])

Map camera will fly to new coordinate

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `coordinates` | `Array` | `Yes` | Coordinates that map camera will jump too |
| `animationDuration` | `Number` | `No` | Duration of camera animation |



```javascript
this.camera.flyTo([lng, lat])
this.camera.flyTo([lng, lat], 12000)
```


#### moveTo(coordinates[, animationDuration])

Map camera will move to new coordinate at the same zoom level

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `coordinates` | `Array` | `Yes` | Coordinates that map camera will move too |
| `animationDuration` | `Number` | `No` | Duration of camera animation |



```javascript
this.camera.moveTo([lng, lat], 200) // eases camera to new location based on duration
this.camera.moveTo([lng, lat]) // snaps camera to new location without any easing
```


#### zoomTo(zoomLevel[, animationDuration])

Map camera will zoom to specified level

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `zoomLevel` | `Number` | `Yes` | Zoom level that the map camera will animate too |
| `animationDuration` | `Number` | `No` | Duration of camera animation |



```javascript
this.camera.zoomTo(16)
this.camera.zoomTo(16, 100)
```


#### setCamera(config)

Map camera will perform updates based on provided config. Advanced use only!

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `config` | `Object` | `Yes` | Camera configuration |



```javascript
this.camera.setCamera({
  centerCoordinate: [lng, lat],
  zoomLevel: 16,
  animationDuration: 2000,
})

this.camera.setCamera({
  stops: [
    { pitch: 45, animationDuration: 200 },
    { heading: 180, animationDuration: 300 },
  ]
})
```



