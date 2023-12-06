import React from 'react';
import { MapView, Camera, VectorSource, FillLayer } from '@rnmapbox/maps';

const styles = {
  boxFill: {
    fillColor: [
      'interpolate',
      ['linear'],
      ['get', 'box'],
      0,
      'green',
      1,
      'blue',
    ],

    fillAntialias: true,
  },
  matchParent: {
    flex: 1,
  },
};

const VECTOR_SOURCE_URL =
  'mapbox://nickitaliano.cj94go8xl18fl2qp92v8bdivv-4kgl9';

class CustomVectorSource extends React.PureComponent {
  state = {
    featuresCount: null,
  };

  queryFeatures = async () => {
    const features = await this._vectorSource.features([
      'react-native-example',
    ]);
    this.setState({ featuresCount: features.features.length });
  };

  render() {
    return (
      <MapView style={styles.matchParent}>
        <Camera zoomLevel={2} centerCoordinate={[-101.051593, 41.370337]} />

        <VectorSource
          id="customSourceExample"
          url={VECTOR_SOURCE_URL}
          ref={(source) => {
            this._vectorSource = source;
          }}
          onPress={(e) => {
            console.log(`VectorSource onPress: ${e.features}`, e.features);
          }}
        >
          <FillLayer
            id="customSourceFill"
            sourceLayerID="react-native-example"
            style={styles.boxFill}
          />
        </VectorSource>
      </MapView>
    );
  }
}

export default CustomVectorSource;

/* end-example-doc */

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'Custom Vector Source',
  tags: ['VectorSource', 'VectorSource#features'],
  docs: '',
};
CustomVectorSource.metadata = metadata;
