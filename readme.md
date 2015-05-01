## react native mapbox gl

_A react native component for accessing [Mapbox GL](https://www.mapbox.com/mapbox-gl/)_

To get this running locally:

1. `npm install react-native-mapbox-gl --save` (Not yet published)
2. In the XCode's `Project navigator`, right click on project's name ➜ `Add Files to <...>`
3. Add `node_modules/react-native-mapbox-gl/RCTMapboxGL.xcodeproj`
4. Also add `node_modules/react-native-mapbox-gl/RCTMapboxGL/MapboxGL.bundle`
5. Select your project in the `Project navigator`. Add `libRCTMapboxGL.a` to your project's Build Phases ➜ Link Binary With Libraries
6. Add the following Cocoa framework dependencies to your target's Link Binary With Libraries build phase:
  * CoreTelephony.framework
  * GLKit.framework
  * ImageIO.framework
  * MobileCoreServices.framework
  * QuartzCore.framework
  * SystemConfiguration.framework
  * libc++.dylib
  * libsqlite3.dylib
  * libz.dylib
7. Cross your fingers and build!

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
