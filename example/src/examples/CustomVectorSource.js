import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';

import sheet from '../styles/sheet';

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
};

const VECTOR_SOURCE_URL =
  'mapbox://nickitaliano.cj94go8xl18fl2qp92v8bdivv-4kgl9';

class CustomVectorSource extends React.PureComponent {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  render() {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView style={sheet.matchParent}>
          <MapboxGL.Camera
            zoomLevel={2}
            centerCoordinate={[-101.051593, 41.370337]}
          />

          <MapboxGL.VectorSource
            id="customSourceExample"
            url={VECTOR_SOURCE_URL}
          >
            <MapboxGL.FillLayer
              id="customSourceFill"
              sourceLayerID="react-native-example"
              style={styles.boxFill}
            />
          </MapboxGL.VectorSource>
        </MapboxGL.MapView>
      </Page>
    );
  }
}

export default CustomVectorSource;
