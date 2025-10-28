import React from 'react';
import { Text } from 'react-native';
import { MapView, Camera } from '@rnmapbox/maps';

import Bubble from '../common/Bubble';

const defaultCamera = {
  centerCoordinate: [-74.005974, 40.712776],
  zoomLevel: 13,
};

const styles = {
  mapView: { flex: 1 },
};

class StyleLayerProperty extends React.Component {
  state = {
    show: true,
  };

  onPress = () => {
    this.setState(
      {
        show: !this.state.show,
      },
      () => {
        this._map.setStyleLayerProperty('building', 'visibility', this.state.show ? 'visible' : 'none');
      },
    );
  };

  render() {
    return (
      <>
        <MapView
          ref={(c) => {
            this._map = c;
          }}
          onPress={this.onPress}
          style={styles.mapView}
        >
          <Camera defaultSettings={defaultCamera} />
        </MapView>
        <Bubble onPress={this.onPress}>
          <Text>{this.state.show ? 'Hide Buildings' : 'Show Buildings'}</Text>
        </Bubble>
      </>
    );
  }
}

export default StyleLayerProperty;

/* end-example-doc */

/**
 * @typedef {import('../common/ExampleMetadata').ExampleWithMetadata} ExampleWithMetadata
 * @type {ExampleWithMetadata['metadata']}
 */
const metadata = {
  title: 'Style Layer Property',
  tags: ['MapView#setStyleLayerProperty'],
  docs: `Changes the property of a layer using the specified layerId`,
};
StyleLayerProperty.metadata = metadata;
