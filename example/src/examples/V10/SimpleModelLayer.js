import React from 'react';
import {
  MapView,
  ShapeSource,
  CircleLayer,
  Camera,
  Models,
  ModelLayer,
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

const modelLayerStyle = {
  modelId: 'car',
  modelScale: [50, 50, 50],
};

const models = {
  car: require('../../assets/sportcar.glb'),
};

class SimpleModelLayer extends React.Component {
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
          <Camera centerCoordinate={[-74.00597, 40.71427]} zoomLevel={14} />
          <Models models={models} />
          <ShapeSource id={'shape-source-id-0'} shape={features}>
            <CircleLayer
              id={'circle-layer'}
              style={circleLayerStyle}
              slot={'bottom'}
            />
            <ModelLayer id="model-layer-id" style={modelLayerStyle} />
          </ShapeSource>
        </MapView>
      </>
    );
  }
}

export default SimpleModelLayer;

/* end-example-doc */

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'Simple Model Layer',
  tags: ['Models', 'ModelLayer'],
  docs: `
Deomnstrate the use of ModelLayer to render, and Models to associate 3D models with names.
`,
};
SimpleModelLayer.metadata = metadata;
