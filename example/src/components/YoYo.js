import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import sheet from '../styles/sheet';
import colors from '../styles/colors';
import {SF_OFFICE_COORDINATE} from '../utils';

import Page from './common/Page';
import BaseExamplePropTypes from './common/BaseExamplePropTypes';

const layerStyles = MapboxGL.StyleSheet.create({
  background: {
    backgroundColor: colors.primary.blue,
  },
  water: {
    fillColor: MapboxGL.StyleSheet.camera(
      {
        1: colors.secondary.green,
        8: colors.secondary.orange,
        10: colors.secondary.red,
        18: colors.secondary.yellow,
      },
      MapboxGL.InterpolationMode.Exponential,
    ),
  },
});

class YoYo extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      zoomLevel: 12,
    };
  }

  componentDidMount() {
    this.cameraLoop();
  }

  cameraLoop() {
    requestAnimationFrame(async () => {
      await this.map.zoomTo(this.state.zoomLevel, 8000);
      const nextZoomLevel = this.state.zoomLevel === 12 ? 2 : 12;
      this.setState({zoomLevel: nextZoomLevel});
      this.cameraLoop();
    });
  }

  render() {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          zoomLevel={2}
          centerCoordinate={SF_OFFICE_COORDINATE}
          ref={ref => (this.map = ref)}
          style={sheet.matchParent}
          styleURL={MapboxGL.StyleURL.Dark}
        >
          <MapboxGL.VectorSource>
            <MapboxGL.BackgroundLayer
              id="background"
              style={layerStyles.background}
            />
            <MapboxGL.FillLayer id="water" style={layerStyles.water} />
          </MapboxGL.VectorSource>
        </MapboxGL.MapView>
      </Page>
    );
  }
}

export default YoYo;
