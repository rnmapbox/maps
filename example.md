## Example `MapboxGLMap`:

```jsx
'use strict';

var React = require('react-native');
var MapboxGLMap = require('react-native-mapbox-gl');
var mapRef = 'mapRef';

var {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  StatusBarIOS,
} = React;

var map = React.createClass({
  mixins: [MapboxGLMap.Mixin],
  getInitialState() {
    return {
      mapLocation: {
        latitude: 0,
        longitude: 0
       },
       center: {
         latitude: 40.72052634,
         longitude: -73.97686958312988
       },
       zoom: 11,
       direction: 40,
       annotations: [{
         latitude: 40.72052634,
         longitude:  -73.97686958312988,
         title: 'This is marker 1',
       },{
         latitude: 40.714541341726175,
         longitude:  -74.00579452514648,
         subtitle: 'Neat, this is a subtitle'
       }]
     }
  },
  onChange(e) {
    this.setState({ currentZoom: e.zoom });
  },
  onUpdateUserLocation(location) {
    console.log(location)
  },
  onOpenAnnotation(annotation) {
    console.log(annotation)
  },
  render: function() {
    StatusBarIOS.setHidden(true);
    return (
      <View style={styles.container}>
       <Text style={styles.text} onPress={() => this.setDirectionAnimated(mapRef, 0)}>
         Set direction to 0
       </Text>
       <Text style={styles.text} onPress={() => this.setZoomLevelAnimated(mapRef, 6)}>
        Zoom out to zoom level 6
      </Text>
       <Text style={styles.text} onPress={() => this.setCenterCoordinateAnimated(mapRef, 48.8589, 2.3447)}>
        Go to Paris at current zoom level {parseInt(this.state.currentZoom)}
      </Text>
      <Text style={styles.text} onPress={() => this.setCenterCoordinateZoomLevelAnimated(mapRef, 35.68829, 139.77492, 14)}>
       Go to Tokyo at fixed zoom level 14
     </Text>
     <Text style={styles.text} onPress={() => this.addAnnotations(mapRef, [{
       latitude: 40.73312,
       longitude:  -73.989,
       title: 'This is a new marker',
     }])}>
      Add new marker
    </Text>
    <Text style={styles.text} onPress={() => this.selectAnnotationAnimated(mapRef, 0)}>
     Open first popup
   </Text>
       <MapboxGLMap
         style={styles.map}
         direction={10}
         rotateEnabled={true}
         showsUserLocation={true}
         ref={mapRef}
         accessToken={'your-mapbox.com-access-token'}
         styleURL={'asset://styles/mapbox-streets-v7.json'}
         centerCoordinate={this.state.center}
         userLocationVisible={true}
         zoomLevel={this.state.zoom}
         onRegionChange={this.onChange}
         annotations={this.state.annotations}
         onOpenAnnotation={this.onOpenAnnotation}
         onUpdateUserLocation={this.onUpdateUserLocation}/>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1
  },
  map: {
    flex:5,
  },
  text: {
    padding: 2
  }
});

AppRegistry.registerComponent('yourProjectName', () => map);
 ```
