## React Native Mapbox GL

_A react native component for accessing [Mapbox GL](https://www.mapbox.com/mapbox-gl/)_

### Installation Process

1. `npm install react-native-mapbox-gl --save`
2. In the XCode's `Project navigator`, right click on project's name ➜ `Add Files to <...>`
3. Add `node_modules/react-native-mapbox-gl/RCTMapboxGL.xcodeproj`
4. Also add `node_modules/react-native-mapbox-gl/RCTMapboxGL/MapboxGL.bundle`
5. Select your project in the `Project navigator`. Add `libRCTMapboxGL.a` to your project's Build Phases ➜ Link Binary With Libraries
6. Add the following Cocoa framework dependencies to your target's Link Binary With Libraries build phase:
  * `CoreTelephony.framework`
  * `GLKit.framework`
  * `ImageIO.framework`
  * `MobileCoreServices.framework`
  * `QuartzCore.framework`
  * `SystemConfiguration.framework`
  * `libc++.dylib`
  * `libsqlite3.dylib`
  * `libz.dylib`
7. Cross your fingers and build!

_[Information on installing Mapbox GL for iOS normally](https://github.com/mapbox/mapbox-gl-native/wiki/Installing-Mapbox-GL-for-iOS)_

### Options

* `style` - Normal `view` flexbox styling
* `rotateEnabled` - `bool` - `optional` - Whether the map can rotate
* `showsUserLocation` - `bool` - `optional` - Whether the users location is shown on the map. Note - the map will not zoom to their location.
* `accessToken` - `string` - `required` - Mapbox access token. Sign up for a [Mapbox account here](mapbox.com/signup).
* `styleURL` - `string` - `required` - A Mapbox GL style sheet. Defaults to `mapbox-streets`. More styles [can be viewed here](https://www.mapbox.com/mapbox-gl-styles).
* `zoomLevel` - `double` - `optional` - Initial zoom level the map will load at. 0 is the entire world, 18 is rooftop level. Defaults to 0.
* `centerCoordinate` - `object` - `optional` - Initial `latitude`/`longitude` the map will load at, defaults to `0,0` Object can be represented as follows:
  * ```js
  var center = { // NYC
    latitude: 40.7223,
    longitude: -73.9878
  };
  ```

### Events

Coming soon.

### Example `MapboxGLMap`:
```jsx
'use strict';

var React = require('react-native');
var MapboxGLMap = require('react-native-mapbox-gl');

var {
  AppRegistry,
  StyleSheet,
} = React;

var map = React.createClass({
  render: function() {
    var center = {
      latitude: 40.7223,
      longitude: -73.9878
    };
    return (
      <MapboxGLMap
        style={styles.map}
        rotateEnabled={true}
        showsUserLocation={true}
        accessToken={'your-mapbox.com-access-token'}
        styleURL={'https://www.mapbox.com/mapbox-gl-styles/styles/mapbox-streets-v7.json'}
        zoomLevel={13}
        centerCoordinate={center} />
    );
  }
});

var styles = StyleSheet.create({
  map: {
    height: 667,
    width: 375
  }
});

AppRegistry.registerComponent('yourProjectName', () => map);
 ```
