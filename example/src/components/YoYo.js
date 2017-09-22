import React from 'react';
import MapboxGL from 'react-native-mapbox-gl';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';

import sheet from '../styles/sheet';
import { SF_OFFICE_COORDINATE } from '../utils';

const layerStyles = MapboxGL.StyleSheet.create({
   water: {
    fillColor: MapboxGL.StyleSheet.camera({
        1: 'green',
        8: 'blue',
        10: 'red',
        18: 'yellow',
    }, MapboxGL.InterpolationMode.Exponential),
  },
});

class YoYo extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor (props) {
    super(props);

    this.state = {
      zoomLevel: 12,
    };

    this.onUpdateZoomLevel = this.onUpdateZoomLevel.bind(this);
  }

  componentDidMount () {
    this.map.zoomTo(this.state.zoomLevel, 8000);
  }

  onUpdateZoomLevel () {
    const nextZoomLevel = this.state.zoomLevel === 12 ? 1 : 12;
    this.setState({ zoomLevel: nextZoomLevel });
    this.map.zoomTo(nextZoomLevel, 8000);
  }

  render () {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
            zoomLevel={2}
            centerCoordinate={SF_OFFICE_COORDINATE}
            onSetCameraComplete={this.onUpdateZoomLevel}
            ref={(ref) => this.map = ref}
            style={sheet.matchParent}
            styleURL={MapboxGL.StyleURL.Dark}>

            <MapboxGL.VectorSource>
              <MapboxGL.FillLayer id='water' style={layerStyles.water} />
            </MapboxGL.VectorSource>
        </MapboxGL.MapView>
      </Page>
    );
  }
}

export default YoYo;
