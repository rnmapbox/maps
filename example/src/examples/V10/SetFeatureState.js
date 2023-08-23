import React from 'react';
import { Alert, View, Text } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import Page from '../common/Page';
import Bubble from '../common/Bubble';

const GeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      id: 'square',
      type: 'Feature',
      properties: {},
      geometry: {
        coordinates: [
          [
            [8.307645244914198, 48.49063431500133],
            [8.307645244914198, 45.57348217729648],
            [12.538446560172616, 45.57348217729648],
            [12.538446560172616, 48.49063431500133],
            [8.307645244914198, 48.49063431500133],
          ],
        ],
        type: 'Polygon',
      },
    },
  ],
};

const styles = {
  mapView: { flex: 1 },
  bubbles: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 50,
    padding: 10,
  },
  bubble: {
    position: 'relative',
    padding: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 0,
    marginBottom: 10,
  },
};

class SerFeatureState extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  state = {
    active: null,
  };

  onPress = () => {
    this.setState(
      {
        active: !this.state.active,
      },
      () => {
        this._map.setFeatureState(
          'customShapeSource',
          'customSourceLayer',
          'square',
          { active: this.state.active },
        );
      },
    );
  };

  onGetFeatureStatePress = async () => {
    const featureState = await this._map.getFeatureState(
      'customShapeSource',
      'customSourceLayer',
      'square',
      'active',
    );
    console.log(featureState);
    Alert.alert('Feature state', JSON.stringify(featureState));
  };

  onRemoveFeatureStatePress = () => {
    this._map.removeFeatureState(
      'customShapeSource',
      'customSourceLayer',
      'square',
    );
    this.setState({
      active: null,
    });
  };

  render() {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView ref={(c) => (this._map = c)} style={styles.mapView}>
          <MapboxGL.Camera
            zoomLevel={4}
            centerCoordinate={[10.36503690835832, 47.036730450390394]}
            animationMode="none"
          />
          <MapboxGL.ShapeSource
            id="customShapeSource"
            shape={GeoJSON}
            onPress={(e) => {
              console.log(`ShapeSource onPress: ${e.features}`, e.features);
            }}
          >
            <MapboxGL.FillLayer
              id="customSourceFill"
              sourceLayerID="customSourceLayer"
              style={{
                fillColor: [
                  'case',
                  ['boolean', ['feature-state', 'active'], false],
                  'green',
                  'red',
                ],
                fillAntialias: true,
              }}
            />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
        <View style={styles.bubbles}>
          <Bubble style={styles.bubble} onPress={this.onPress}>
            <Text>Toggle Feature State</Text>
          </Bubble>
          <Bubble
            style={styles.bubble}
            onPress={this.onRemoveFeatureStatePress}
          >
            <Text>Remove Feature State</Text>
          </Bubble>
          <Bubble style={styles.bubble} onPress={this.onGetFeatureStatePress}>
            <Text>Get Feature State</Text>
          </Bubble>
        </View>
      </Page>
    );
  }
}

export default SerFeatureState;
