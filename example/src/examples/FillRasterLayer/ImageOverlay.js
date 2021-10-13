import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {Text} from 'react-native';

import Bubble from '../common/Bubble';
import sheet from '../../styles/sheet';
import radar0 from '../../assets/radar.png';
import radar1 from '../../assets/radar1.png';
import radar2 from '../../assets/radar2.png';
import Page from '../common/Page';
import BaseExamplePropTypes from '../common/BaseExamplePropTypes';

const styles = {
  rasterLayer: {rasterOpacity: 0.6},
  bubble: {bottom: 100},
};

const frames = [radar0, radar1, radar2];
const coordQuads = [
  [
    [-80.425, 46.437], // top left
    [-71.516, 46.437], // top right
    [-71.516, 37.936], // bottom right
    [-80.425, 37.936], // bottom left
  ],
  [
    [-85.425, 45.437], // top left
    [-75.516, 45.437], // top right
    [-75.516, 36.936], // bottom right
    [-85.425, 36.936], // bottom left
  ],
];

class ImageOverlay extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  state = {
    radarFrameIndex: 0,
    coords: coordQuads[0],
    dynamic: false,
  };

  _timeout = null;

  componentDidMount() {
    this.heartbeat();
  }

  heartbeat() {
    this._timeout = setTimeout(() => {
      requestAnimationFrame(() => {
        let nextFrame = this.state.radarFrameIndex + 1;
        if (nextFrame > 1) {
          nextFrame = 0;
        }

        if (this.state.dynamic) {
          this.setState({
            radarFrameIndex: nextFrame,
            coords: coordQuads[nextFrame],
          });
        } else {
          this.setState({radarFrameIndex: nextFrame});
        }
        this.heartbeat();
      });
    }, 1000);
  }

  componentWillUnmount() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }

  render() {
    const bubbleText = this.state.dynamic
      ? 'Static coordinates'
      : 'Dynamic coordinates';
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          ref={ref => (this.map = ref)}
          style={sheet.matchParent}
          styleURL={MapboxGL.StyleURL.Satellite}>
          <MapboxGL.Camera zoomLevel={4} centerCoordinate={[-79, 40]} />

          <MapboxGL.Animated.ImageSource
            key="d"
            id="radarSource"
            coordinates={this.state.coords}
            url={frames[this.state.radarFrameIndex]}>
            <MapboxGL.RasterLayer id="radarLayer" style={styles.rasterLayer} />
          </MapboxGL.Animated.ImageSource>
        </MapboxGL.MapView>
        <Bubble
          onPress={() => {
            this.setState({dynamic: !this.state.dynamic});
          }}
          style={styles.bubble}>
          <Text>{bubbleText}</Text>
        </Bubble>
      </Page>
    );
  }
}

export default ImageOverlay;
