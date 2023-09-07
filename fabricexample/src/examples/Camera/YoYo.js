import React from 'react';
import MapboxGL from '@rnmapbox/maps';

import sheet from '../../styles/sheet';
import colors from '../../styles/colors';
import {SF_OFFICE_COORDINATE} from '../../utils';
import Page from '../common/Page';
import BaseExamplePropTypes from '../common/BaseExamplePropTypes';

const layerStyles = {
  water: {
    fillColor: [
      'interpolate',
      ['exponential', 1],
      ['zoom'],
      1,
      colors.secondary.green,
      8,
      colors.secondary.orange,
      10,
      colors.secondary.red,
      18,
      colors.secondary.yellow,
    ],
  },
};

class YoYo extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  timeout = null;

  constructor(props) {
    super(props);

    this.state = {
      zoomLevel: 2,
    };
  }

  componentDidMount() {
    this.cameraLoop();
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  cameraLoop() {
    requestAnimationFrame(async () => {
      const nextZoomLevel = this.state.zoomLevel === 12 ? 2 : 12;
      this.setState({zoomLevel: nextZoomLevel});
      this.timeout = setTimeout(() => this.cameraLoop(), 2000);
    });
  }

  render() {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          ref={ref => (this.map = ref)}
          style={sheet.matchParent}
          styleURL={MapboxGL.StyleURL.Dark}>
          <MapboxGL.Camera
            zoomLevel={this.state.zoomLevel}
            centerCoordinate={SF_OFFICE_COORDINATE}
          />

          <MapboxGL.VectorSource>
            <MapboxGL.FillLayer id="water" style={layerStyles.water} />
          </MapboxGL.VectorSource>
        </MapboxGL.MapView>
      </Page>
    );
  }
}

export default YoYo;
