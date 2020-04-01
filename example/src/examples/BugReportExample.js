import React from 'react';
import {
  MapView,
  ShapeSource,
  LineLayer,
  Camera,
} from '@react-native-mapbox-gl/maps';

const aLine = {
  type: 'LineString',
  coordinates: [
    [-74.00597, 40.71427],
    [-74.00697, 40.71527],
  ],
};

class BugReportExample extends React.Component {
  render() {
    return (
      <MapView style={{flex: 1}}>
        <Camera centerCoordinate={[-74.00597, 40.71427]} zoomLevel={14} />
        <ShapeSource id="idStreetLayer" shape={aLine}>
          <LineLayer id="idStreetLayer" />
        </ShapeSource>
      </MapView>
    );
  }
}

export default BugReportExample;
