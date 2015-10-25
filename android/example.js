'use strict';

var React = require('react-native');
var Mapbox = require('react-native-mapbox-gl');
var {
  AppRegistry,
  StyleSheet,
  View
} = React;

var MapExample = React.createClass({
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
        id: 'marker2'
      }, {
        coordinates: [40.7923, -73.9178],
        type: 'point',
        title: 'Important!',
        subtitle: 'Neat, this is a custom annotation image'
      }, {
        "coordinates": [[40.76572150042782,-73.99429321289062],[40.743485405490695, -74.00218963623047],[40.728266950429735,-74.00218963623047],[40.728266950429735,-73.99154663085938],[40.73633186448861,-73.98983001708984],[40.74465591168391,-73.98914337158203],[40.749337730454826,-73.9870834350586]],
        "type": "polyline",
        "strokeColor": "#00FB00",
        "strokeWidth": 3,
        "alpha": 0.5,
        "id": "foobar"
      }, {
        "coordinates": [[40.749857912194386, -73.96820068359375], [40.741924698522055,-73.9735221862793], [40.735681504432264,-73.97523880004883], [40.7315190495212,-73.97438049316406], [40.729177554196376,-73.97180557250975], [40.72345355209305,-73.97438049316406], [40.719290332250544,-73.97455215454102], [40.71369559554873,-73.97729873657227], [40.71200407096382,-73.97850036621094], [40.71031250340588,-73.98691177368163], [40.71031250340588,-73.99154663085938]],
        "type": "polygon",
        "alpha":1,
        "fillColor": "#FFFFFF",
        "strokeColor": "#FFFFFF",
        "strokeWidth": 1,
        "id": "zap"
      }]
    }
  },
  onRegionChange(location) {
    console.log(location);
  },
  render: function() {
    return (
      <View style={styles.container}>
        <Mapbox
          annotations={this.state.annotations}
          accessToken={'mapbox-access-token'}
          centerCoordinate={this.state.center}
          debugActive={false}
          direction={0}
          onRegionChange={this.onRegionChange}
          rotationEnabled={true}
          scrollEnabled={true}
          style={styles.map}
          showsUserLocation={true}
          styleUrl={'asset://styles/streets-v8.json'}
          zoomEnabled={true}
          zoomLevel={12}
        />
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    width: require('Dimensions').get('window').width,
    flex: 1
  }
});

AppRegistry.registerComponent('your-app-name', () => MapExample);
