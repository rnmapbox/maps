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
    return (
      <View style={styles.container}>
        <MapboxGLView style={{width: 0, height: 0}}/>
        <MapboxGLView
           style={styles.map}
           rotateEnabled={true}
           showsUserLocation={true}
           accessToken={'pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig'}
           styleURL={'https://www.mapbox.com/mapbox-gl-styles/styles/light-v7.json'}
           zoomLevel={1}
         />
      </View>
    );
  }
});

var styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
     height: 668,
     width: 380
    }
});


AppRegistry.registerComponent('mapboxGLReactNative', () => map);
