import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../styles/sheet';
import radar0 from '../assets/radar.png';
import radar1 from '../assets/radar1.png';
import radar2 from '../assets/radar2.png';

import Page from './common/Page';
import BaseExamplePropTypes from './common/BaseExamplePropTypes';

const frames = [radar0, radar1, radar2];

class ImageOverlay extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      radarFrameIndex: 0,
    };

    this._timeout = null;
  }

  componentDidMount() {
    this.heartbeat();
  }

  heartbeat() {
    this._timeout = setTimeout(() => {
      requestAnimationFrame(() => {
        let nextFrame = this.state.radarFrameIndex + 1;

        if (nextFrame > 2) {
          nextFrame = 0;
        }

        this.setState({radarFrameIndex: nextFrame});
        this.heartbeat();
      });
    }, 500);
  }

  componentWillUnmount() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }

  render() {
    const coordQuad = [
      [-80.425, 46.437], // top left
      [-71.516, 46.437], // top right
      [-71.516, 37.936], // bottom right
      [-80.425, 37.936], // bottom left
    ];

    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          ref={ref => (this.map = ref)}
          style={sheet.matchParent}
          styleURL={MapboxGL.StyleURL.Dark}>
          <MapboxGL.Camera
            zoomLevel={5.2}
            centerCoordinate={[-75.789, 41.874]}
          />

          <MapboxGL.Animated.ImageSource
            key="d"
            id="radarSource"
            coordinates={coordQuad}
            url={frames[this.state.radarFrameIndex]}>
            <MapboxGL.RasterLayer id="radarLayer" />
          </MapboxGL.Animated.ImageSource>
        </MapboxGL.MapView>
      </Page>
    );
  }
}

export default ImageOverlay;
