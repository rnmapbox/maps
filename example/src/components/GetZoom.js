import React from 'react';
import {Text} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';
import Bubble from './common/Bubble';

class GetZoom extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      zoom: 9,
    };

    this.onRegionDidChange = this.onRegionDidChange.bind(this);
  }

  async onRegionDidChange() {
    const zoom = await this._map.getZoom();
    this.setState({zoom});
  }

  render() {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          onRegionDidChange={this.onRegionDidChange}
          zoomLevel={9}
          ref={c => (this._map = c)}
          onPress={this.onPress}
          centerCoordinate={[-73.970895, 40.723279]}
          style={{flex: 1}}
        />

        <Bubble>
          <Text>Current zoom: {this.state.zoom}</Text>
        </Bubble>
      </Page>
    );
  }
}

export default GetZoom;
