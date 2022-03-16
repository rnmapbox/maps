import React from 'react';
import {Button} from 'react-native';
import {
  MapView,
  ShapeSource,
  SymbolLayer,
  CircleLayer,
  Camera,
} from '@rnmapbox/maps';

const styles = {
  mapView: {flex: 1},
  circleLayer: {
    circleRadiusTransition: {duration: 5000, delay: 0},
    circleColor: '#ff0000',
  },
};

const features = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'a-feature',
      properties: {
        icon: 'example',
        text: 'example-icon-and-label',
      },
      geometry: {
        type: 'Point',
        coordinates: [-74.00597, 40.71427],
      },
    },
    {
      type: 'Feature',
      id: 'b-feature',
      properties: {
        text: 'just-label',
      },
      geometry: {
        type: 'Point',
        coordinates: [-74.001097, 40.71527],
      },
    },
    {
      type: 'Feature',
      id: 'c-feature',
      properties: {
        icon: 'example',
      },
      geometry: {
        type: 'Point',
        coordinates: [-74.00697, 40.72427],
      },
    },
  ],
};

class BugReportExample extends React.Component {
  state = {
    radius: 20,
  };

  render() {
    const circleLayerStyle = {
      ...styles.circleLayer,
      ...{circleRadius: this.state.radius},
    };

    return (
      <>
        <Button
          title="Grow"
          onPress={() => this.setState({radius: this.state.radius + 20})}
        />
        <MapView style={styles.mapView}>
          <Camera centerCoordinate={[-74.00597, 40.71427]} zoomLevel={14} />
          <ShapeSource id={'shape-source-id-0'} shape={features}>
            <CircleLayer id={'circle-layer'} style={circleLayerStyle} />
            <SymbolLayer
              id="symbol-id"
              style={{
                iconImage: ['get', 'icon'],
              }}
            />
          </ShapeSource>
        </MapView>
      </>
    );
  }
}

export default BugReportExample;
