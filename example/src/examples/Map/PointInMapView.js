import React from 'react';
import { Text } from 'react-native';
import { MapView, Camera } from '@rnmapbox/maps';

import Bubble from '../common/Bubble';

const styles = {
  mapView: { flex: 1 },
};

class PointInMapView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pointInView: null,
    };

    this.onPress = this.onPress.bind(this);
  }

  async onPress(e) {
    const pointInView = await this._map.getPointInView(e.geometry.coordinates);
    this.setState({ pointInView });
  }

  renderPointInView() {
    if (!this.state.pointInView) {
      return <Text>Touch map to see xy pixel location</Text>;
    }

    return [
      <Text key={'x'}>x: {this.state.pointInView[0]}</Text>,
      <Text key={'y'}>y: {this.state.pointInView[1]}</Text>,
    ];
  }

  render() {
    return (
      <>
        <MapView
          ref={(c) => (this._map = c)}
          onPress={this.onPress}
          style={styles.mapView}
        >
          <Camera zoomLevel={9} centerCoordinate={[-73.970895, 40.723279]} />
        </MapView>

        <Bubble>{this.renderPointInView()}</Bubble>
      </>
    );
  }
}

export default PointInMapView;

/* end-example-doc */

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'Point in Map View',
  tags: ['MapView#pointInMapView'],
  docs: `
Converts a coordinate to a point in the current view.
`,
};
PointInMapView.metadata = metadata;
