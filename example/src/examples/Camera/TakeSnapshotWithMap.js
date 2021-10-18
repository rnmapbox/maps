import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Image} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../../styles/sheet';
import colors from '../../styles/colors';
import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import Page from '../common/Page';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary.blueLight,
    height: 60,
    justifyContent: 'center',
  },
  buttonText: {color: 'white'},
  imageContainer: {flex: 0.5},
  map: {
    flex: 0.5,
  },
  mapContainer: {flex: 1},
});

const layerStyles = {
  building: {
    fillExtrusionHeight: ['get', 'height'],
    fillExtrusionBase: ['get', 'min_height'],
    fillExtrusionColor: 'blue',
  },
};

class TakeSnapshotWithMap extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      uri: '',
    };
  }

  async onTakeSnapshot() {
    const uri = await this.map.takeSnap(false);
    this.setState({uri});
  }

  render() {
    return (
      <Page {...this.props}>
        <View style={styles.mapContainer}>
          <MapboxGL.MapView ref={ref => (this.map = ref)} style={styles.map}>
            <MapboxGL.Camera
              zoomLevel={16}
              pitch={45}
              centerCoordinate={[-122.400021, 37.789085]}
            />

            <MapboxGL.VectorSource>
              <MapboxGL.FillExtrusionLayer
                id="building3d"
                sourceLayerID="building"
                style={layerStyles.building}
              />
            </MapboxGL.VectorSource>
          </MapboxGL.MapView>

          <View style={styles.imageContainer}>
            {this.state.uri ? (
              <Image
                resizeMode="contain"
                style={sheet.matchParent}
                source={{uri: this.state.uri}}
              />
            ) : null}
          </View>
        </View>

        <TouchableOpacity onPress={() => this.onTakeSnapshot()}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Take snapshot</Text>
          </View>
        </TouchableOpacity>
      </Page>
    );
  }
}

export default TakeSnapshotWithMap;
