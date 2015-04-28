'use strict';

var React = require('react-native');
var MapboxGLView = require('./mapboxGL.js')
var {
  AppRegistry,
  StyleSheet,
  Text,
  View
} = React;

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
           accessToken={'pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig'}
           styleURL={'https://www.mapbox.com/mapbox-gl-styles/styles/mapbox-streets-v7.json'}
           zoomLevel={13}
           centerCoordinate={center}
         />
      </View>
    );
  }
});

var styles = StyleSheet.create({
    map: {
     height: 667,
     width: 375
    }
});


AppRegistry.registerComponent('mapboxGLReactNative', () => map);
