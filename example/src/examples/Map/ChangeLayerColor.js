import React from 'react';
import {Text} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import Page from '../common/Page';
import Bubble from '../common/Bubble';

const defaultCamera = {
  centerCoordinate: [12.338, 45.4385],
  zoomLevel: 17.4,
};

const styles = {
  mapView: {flex: 1},
};

class ChangeLayerColor extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  state = {
    fillColor: '',
  };

  onPress = () => {
    const fillColor = `#${Math.random().toString(16).substr(-6)}`;
    this.setState({fillColor});
  };

  render() {
    const {fillColor} = this.state;
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          ref={c => (this._map = c)}
          onPress={this.onPress}
          style={styles.mapView}>
          <MapboxGL.Camera defaultSettings={defaultCamera} />
          {!!fillColor && <MapboxGL.FillLayer id="water" style={{fillColor}} />}
        </MapboxGL.MapView>
        <Bubble onPress={this.onPress}>
          <Text>Paint Water</Text>
        </Bubble>
      </Page>
    );
  }
}

export default ChangeLayerColor;
