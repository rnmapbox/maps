A work in progress.

To get this running locally:
* `pod install`
* Open `mapboxGlReactnative.xcworkspace`
* Link Binary With Libraries: `MapboxGL.framework`
* Run

_[Info on installing Mapbox GL normally](https://github.com/mapbox/mapbox-gl-native/wiki/Installing-Mapbox-GL-for-iOS)_

#### Adding a `MapboxGLView`:
```jsx
var map = React.createClass({
  render: function() {
    var center = {
     latitude: 40.7223,
     longitude: -73.9878
   };
    return (
      <View>
        <MapboxGLView style={{width: 0, height: 0}}/>
        <MapboxGLView
           style={styles.map}
           rotateEnabled={true}
           showsUserLocation={true}
           accessToken={'your-mapbox.com-access-token'}
           styleURL={'https://www.mapbox.com/mapbox-gl-styles/styles/mapbox-streets-v7.json'}
           zoomLevel={13}
           centerCoordinate={center}
         />
      </View>
    );
  }
});

 ```
