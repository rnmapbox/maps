## <MapboxGL.MapView />
### MapView backed by Mapbox Native GL
    

#### props
| Prop | Type | Default | Required | Description |
| ---- | :--: | :-----: | :------: | ----------: |
| animated | `bool` | `false` | `false` | Animates changes between pitch and bearing |
| centerCoordinate | `arrayOf` | `none` | `false` | Initial center coordinate on map [lng, lat] |
| showUserLocation | `bool` | `none` | `false` | Shows the users location on the map |
| userTrackingMode | `number` | `MapboxGL.UserTrackingModes.None` | `false` | The mode used to track the user location on the map |
| heading | `number` | `0` | `false` | Initial heading on map |
| pitch | `number` | `0` | `false` | Initial pitch on map |
| style | `any` | `none` | `false` | Style for wrapping React Native View |
| styleURL | `string` | `MapboxGL.StyleURL.Street` | `false` | Style URL for map |
| zoomLevel | `number` | `16` | `false` | Initial zoom level of map |
| minZoomLevel | `number` | `none` | `false` | Min zoom level of map |
| maxZoomLevel | `number` | `none` | `false` | Max zoom level of map |
| scrollEnabled | `bool` | `true` | `false` | Enable/Disable scroll on the map |
| pitchEnabled | `bool` | `true` | `false` | Enable/Disable pitch on map |
| onPress | `func` | `none` | `false` | Map press listener, gets called when a user presses the map |
| onLongPress | `func` | `none` | `false` | Map long press listener, gets called when a user long presses the map |
| onRegionWillChange | `func` | `none` | `false` | This event is triggered whenever the currently displayed map region is about to change. |
| onRegionIsChanging | `func` | `none` | `false` | This event is triggered whenever the currently displayed map region is changing. |
| onRegionDidChange | `func` | `none` | `false` | This event is triggered whenever the currently displayed map region finished changing |
| onWillStartLoadingMap | `func` | `none` | `false` | This event is triggered when the map is about to start loading a new map style. |
| onDidFinishLoadingMap | `func` | `none` | `false` | This is triggered when the map has successfully loaded a new map style. |
| onDidFailLoadingMap | `func` | `none` | `false` | This event is triggered when the map has failed to load a new map style. |
| onWillStartRenderingFrame | `func` | `none` | `false` | This event is triggered when the map will start rendering a frame. |
| onDidFinishRenderingFrame | `func` | `none` | `false` | This event is triggered when the map finished rendering a frame. |
| onDidFinishRenderingFrameFully | `func` | `none` | `false` | This event is triggered when the map fully finished rendering a frame. |
| onWillStartRenderingMap | `func` | `none` | `false` | This event is triggered when the map will start rendering the map. |
| onDidFinishRenderingMap | `func` | `none` | `false` | This event is triggered when the map finished rendering the map. |
| onDidFinishRenderingMapFully | `func` | `none` | `false` | This event is triggered when the map fully finished rendering the map. |
| onDidFinishLoadingStyle | `func` | `none` | `false` | This event is triggered when a style has finished loading. |
| onFlyToComplete | `func` | `none` | `false` | This event is triggered when a fly to animation is cancelled or completed after calling flyTo |
| onSetCameraComplete | `func` | `none` | `false` | This event is triggered once the camera is finished after calling setCamera |
| onUserLocationChange | `func` | `none` | `false` | This event is triggered when the users location changes depands on showUserLocation |

    