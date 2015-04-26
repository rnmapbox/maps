A work in progress.

To get this running locally:
* `pod install`
* Open `mapboxGlReactnative.xcworkspace`
* Link Binary With Libraries: `MapboxGL.framework`
* Run

Adding a mapboxGLView:
```jsx
<MapboxGLView
   style={styles.map}
   rotateEnabled={true}
   showsUserLocation={true}
   accessToken={'Your-Mapox.com-accessToken'}
   styleURL={'https://www.mapbox.com/mapbox-gl-styles/styles/light-v7.json'} //Optional. Defaults to Mapbox Streets
   zoomLevel={1}
 />
 ```
