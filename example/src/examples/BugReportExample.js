import React from 'react';
import { Button } from 'react-native';
import {
  Images,
  MapView,
  ShapeSource,
  SymbolLayer,
  CircleLayer,
  Camera,
  VectorSource,
  LineLayer,
} from '@rnmapbox/maps';

const styles = {
  mapView: { flex: 1 },
  circleLayer: {
    circleRadiusTransition: { duration: 5000, delay: 0 },
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
      ...{ circleRadius: this.state.radius },
    };

    return (
      <>
        <MapView style={styles.mapView}>
          <Camera
            defaultSettings={{
              centerCoordinate: [-87.622088, 41.878781],
              zoomLevel: 10,
            }}
          />
          <Images images={{ example: require('../assets/example.png') }} />
          <VectorSource
            id="mapillary"
            tileUrlTemplates={[
              'https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token=MLY|4142433049200173|72206abe5035850d6743b23a49c41333'.replaceAll(
                '|',
                '%7C',
              ),
            ]}
          >
            <LineLayer
              id="mapillary-lines"
              sourceLayerID="sequence"
              style={{
                lineCap: 'round',
                lineJoin: 'round',
                lineOpacity: 0.6,
                lineColor: 'rgb(53, 175, 109)',
                lineWidth: 2.0,
              }}
            />
          </VectorSource>
          <ShapeSource id={'shape-source-id-0'} shape={features}>
            <CircleLayer
              id={'circle-layer'}
              style={circleLayerStyle}
              slot={'bottom'}
            />
            <SymbolLayer
              id="symbol-id"
              style={{
                iconImage: ['get', 'icon'],
              }}
              slot={'middle'}
            />
          </ShapeSource>
        </MapView>
      </>
    );
  }
}

export default BugReportExample;
