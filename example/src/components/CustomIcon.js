import React from 'react';
import {Text} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import sheet from '../styles/sheet';
import exampleIcon from '../assets/example.png';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';
import Bubble from './common/Bubble';

const styles = MapboxGL.StyleSheet.create({
  icon: {
    iconImage: exampleIcon,
    iconAllowOverlap: true,
    iconSize: 0.5,
  },
});

class CustomIcon extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      featureCollection: MapboxGL.geoUtils.makeFeatureCollection(),
    };

    this.onPress = this.onPress.bind(this);
    this.onSourceLayerPress = this.onSourceLayerPress.bind(this);
  }

  async onPress(e) {
    const feature = MapboxGL.geoUtils.makeFeature(e.geometry);
    feature.id = `${Date.now()}`;

    this.setState({
      featureCollection: MapboxGL.geoUtils.addToFeatureCollection(
        this.state.featureCollection,
        feature,
      ),
    });
  }

  onSourceLayerPress(e) {
    const feature = e.nativeEvent.payload;
    console.log('You pressed a layer here is your feature', feature); // eslint-disable-line
  }

  render() {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          zoomLevel={9}
          ref={c => (this._map = c)}
          onPress={this.onPress}
          centerCoordinate={[-73.970895, 40.723279]}
          style={sheet.matchParent}
        >
          <MapboxGL.ShapeSource
            id="symbolLocationSource"
            hitbox={{width: 20, height: 20}}
            onPress={this.onSourceLayerPress}
            shape={this.state.featureCollection}
          >
            <MapboxGL.SymbolLayer
              id="symbolLocationSymbols"
              minZoomLevel={1}
              style={styles.icon}
            />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>

        <Bubble>
          <Text>Tap to add an icon</Text>
        </Bubble>
      </Page>
    );
  }
}

export default CustomIcon;
