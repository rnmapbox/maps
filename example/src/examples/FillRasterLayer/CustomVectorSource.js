import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {Text} from 'react-native';

import sheet from '../../styles/sheet';
import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import Page from '../common/Page';
import Bubble from '../common/Bubble';

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

  state = {
    featuresCount: null,
  };

  queryFeatures = async () => {
    const features = await this._vectorSource.features([
      'react-native-example',
    ]);
    this.setState({featuresCount: features.features.length});
  };

  render() {
    const {featuresCount} = this.state;
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
            ref={source => {
              this._vectorSource = source;
            }}
            onPress={e => {
              console.log(`VectorSource onPress: ${e.features}`, e.features);
            }}>
            <MapboxGL.FillLayer
              id="customSourceFill"
              sourceLayerID="react-native-example"
              style={styles.boxFill}
            />
          </MapboxGL.VectorSource>
        </MapboxGL.MapView>
        <Bubble onPress={this.queryFeatures}>
          <Text>Query features:</Text>
          {featuresCount && <Text>Count: {featuresCount}</Text>}
        </Bubble>
      </Page>
    );
  }
}

export default CustomVectorSource;
