import React from 'react';
import { Text } from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';
import Bubble from './common/Bubble';

import sheet from '../styles/sheet';
import exampleIcon from '../assets/example.png';

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

  constructor (props) {
    super(props);

    this.state = {
      featureCollection: MapboxGL.geoUtils.makeFeatureCollection(),
    };

    this.onPress = this.onPress.bind(this);
  }

  async onPress (e) {
    this.setState({
      featureCollection: MapboxGL.geoUtils.addToFeatureCollection(
        this.state.featureCollection,
        MapboxGL.geoUtils.makeFeature(e.geometry),
      ),
    });
  }

  render () {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
            zoomLevel={9}
            ref={(c) => this._map = c}
            onPress={this.onPress}
            centerCoordinate={[-73.970895, 40.723279]}
            style={sheet.matchParent}>

            <MapboxGL.ShapeSource id='symbolLocationSource' shape={this.state.featureCollection}>
              <MapboxGL.SymbolLayer
                id='symbolLocationSymbols'
                minZoomLevel={1}
                style={styles.icon} />
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
