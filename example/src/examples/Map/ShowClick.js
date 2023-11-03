import React from 'react';
import { Text } from 'react-native';
import { MapView, Camera } from '@rnmapbox/maps';

import Bubble from '../common/Bubble';

const styles = { matchParent: { flex: 1 } };

class ShowClick extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: undefined,
      longitude: undefined,
      screenPointX: undefined,
      screenPointY: undefined,
    };

    this.onPress = this.onPress.bind(this);
  }

  get hasValidLastClick() {
    return (
      typeof this.state.latitude === 'number' &&
      typeof this.state.longitude === 'number'
    );
  }

  onPress(event) {
    const { geometry, properties } = event;

    this.setState({
      latitude: geometry.coordinates[1],
      longitude: geometry.coordinates[0],
      screenPointX: properties.screenPointX,
      screenPointY: properties.screenPointY,
    });
  }

  renderLastClicked() {
    if (!this.hasValidLastClick) {
      return (
        <Bubble>
          <Text>Click the map!</Text>
        </Bubble>
      );
    }

    return (
      <Bubble testID="location-bubble">
        <Text testID="location-bubble-latitude">
          Latitude: {this.state.latitude}
        </Text>
        <Text testID="location-bubble-longitude">
          Longitude: {this.state.longitude}
        </Text>
        <Text>Screen Point X: {this.state.screenPointX}</Text>
        <Text>Screen Point Y: {this.state.screenPointY}</Text>
      </Bubble>
    );
  }

  render() {
    return (
      <>
        <MapView
          style={styles.matchParent}
          onPress={this.onPress}
          testID={'show-click-map-view'}
        >
          <Camera
            defaultSettings={{ centerCoordinate: [-77.036086, 38.910233] }}
          />
        </MapView>
        {this.renderLastClicked()}
      </>
    );
  }
}

export default ShowClick;

/* end-example-doc */

const metadata = {
  title: 'Show Click',
  tags: ['MapView#onPress'],
  docs: `
Demonstates onPress event and how to get the screen point of the click.
`,
};
ShowClick.metadata = metadata;
