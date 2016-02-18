'use strict';

var React = require('react-native');
var Mapbox = require('react-native-mapbox-gl');
var {
  AppRegistry,
  StyleSheet,
  View,
  Text
} = React;
var mapRef = 'map';

var MapExample = React.createClass({
  mixins: [Mapbox.Mixin],
  getInitialState() {
    return {
      center: {
        latitude: 40.7223,
        longitude: -73.9878
      },
      annotations: [{
        coordinates: [40.7223, -73.9878],
        type: 'point',
        title: 'Important!',
        subtitle: 'Neat, this is a custom annotation image',
        id: 'marker2',
        annotationImage: {
          url: 'https://cldup.com/7NLZklp8zS.png',
          height: 25,
          width: 25
        }
      }, {
        coordinates: [40.7923, -73.9178],
        type: 'point',
        title: 'Important!',
        subtitle: 'Neat, this is a custom annotation image'
      }, {
        coordinates: [[40.76572150042782,-73.99429321289062],[40.743485405490695, -74.00218963623047],[40.728266950429735,-74.00218963623047],[40.728266950429735,-73.99154663085938],[40.73633186448861,-73.98983001708984],[40.74465591168391,-73.98914337158203],[40.749337730454826,-73.9870834350586]],
        type: 'polyline',
        strokeColor: '#00FB00',
        strokeWidth: 3,
        alpha: 0.5,
        id: 'foobar'
      }, {
        coordinates: [[40.749857912194386, -73.96820068359375], [40.741924698522055,-73.9735221862793], [40.735681504432264,-73.97523880004883], [40.7315190495212,-73.97438049316406], [40.729177554196376,-73.97180557250975], [40.72345355209305,-73.97438049316406], [40.719290332250544,-73.97455215454102], [40.71369559554873,-73.97729873657227], [40.71200407096382,-73.97850036621094], [40.71031250340588,-73.98691177368163], [40.71031250340588,-73.99154663085938]],
        type: 'polygon',
        alpha:1,
        fillColor: '#FFFFFF',
        strokeColor: '#FFFFFF',
        strokeWidth: 1,
        id: 'zap'
      }]
    }
  },
  onUserLocationChange(location) {
    console.log(location);
  },
  onLongPress(location) {
    console.log(location);
  },
  onOpenAnnotation(annotation) {
    console.log(annotation);
  },
  render() {
    return (
      <View style={styles.container}>
        <Text onPress={() => this.setDirectionAnimated(mapRef, 0)}>
          Set direction to 0
        </Text>
        <Text onPress={() => this.setCenterCoordinateAnimated(mapRef, 40.68454331694491, -73.93592834472656)}>
          Go to New York at current zoom level
        </Text>
        <Text onPress={() => this.setCenterCoordinateZoomLevelAnimated(mapRef, 35.68829, 139.77492, 14)}>
          Go to Tokyo at fixed zoom level 14
        </Text>
        <Text onPress={() => this.addAnnotations(mapRef, [{
          coordinates: [40.73312,-73.989],
          type: 'point',
          title: 'This is a new marker',
          id: 'foo'
        }, {
          'coordinates': [[40.75974059207392, -74.02484893798828], [40.68454331694491, -73.93592834472656]],
          'type': 'polyline'
        }])}>
          Add new marker
        </Text>
        <Text onPress={() => this.setUserTrackingMode(mapRef, this.userTrackingMode.follow)}>
          Set userTrackingMode to follow
        </Text>
        <Text onPress={() => this.removeAllAnnotations(mapRef)}>
          Remove all annotations
        </Text>
        <Text onPress={() => this.setTilt(mapRef, 50)}>
          Set tilt to 50
        </Text>
        <Text onPress={() => this.setVisibleCoordinateBoundsAnimated(mapRef, 40.712, -74.227, 40.774, -74.125, 100, 100, 100, 100)}>
          Set visible bounds to 40.7, -74.2, 40.7, -74.1
        </Text>
        <Text onPress={() => {
            this.getDirection(mapRef, (direction) => {
             console.log(direction);
            });
          }}>
          Get direction
        </Text>
        <Text onPress={() => {
            this.getCenterCoordinateZoomLevel(mapRef, (location) => {
             console.log(location);
            });
          }}>
          Get location
        </Text>
        <Mapbox
          annotations={this.state.annotations}
          accessToken={'your-mapbox.com-access-token'}
          centerCoordinate={this.state.center}
          debugActive={false}
          direction={10}
          ref={mapRef}
          onRegionChange={this.onRegionChange}
          rotateEnabled={true}
          scrollEnabled={true}
          style={styles.container}
          showsUserLocation={true}
          styleURL={this.mapStyles.emerald}
          userTrackingMode={this.userTrackingMode.none}
          zoomEnabled={true}
          zoomLevel={10}
          compassIsHidden={true}
          onUserLocationChange={this.onUserLocationChange}
          onLongPress={this.onLongPress}
          onOpenAnnotation={this.onOpenAnnotation}
        />
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

AppRegistry.registerComponent('your-app-name', () => MapExample);
