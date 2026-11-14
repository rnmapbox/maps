import { useState } from 'react';
import {
  Camera,
  CircleLayer,
  Images,
  MapView,
  ShapeSource,
  SymbolLayer,
} from '@rnmapbox/maps';
import { type FeatureCollection } from 'geojson';
import { Button } from 'react-native';

const styles = {
  mapView: { flex: 1 },
  circleLayer: {
    circleRadiusTransition: { duration: 5000, delay: 0 },
    circleColor: '#ff0000',
  },
};

const features: FeatureCollection = {
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

const BugReportExample = () => {
  const [radius, setRadius] = useState(20);

  const circleLayerStyle = {
    ...styles.circleLayer,
    ...{ circleRadius: radius },
  };

  return (
    <>
      <Button title="Grow" onPress={() => setRadius(radius + 20)} />
      <MapView style={styles.mapView}>
        <Camera centerCoordinate={[-74.00597, 40.71427]} zoomLevel={14} />
        <Images images={{ example: require('../assets/example.png') }} />
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
};

export default BugReportExample;
