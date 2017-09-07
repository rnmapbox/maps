import React from 'react';
import MapboxGL from 'react-native-mapbox-gl';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';

import sheet from '../styles/sheet';
import { DEFAULT_CENTER_COORDINATE } from '../utils';

class YoYo extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor (props) {
    super(props);

    this.state = {
      zoomLevel: 16,
    };

    this.onUpdateZoomLevel = this.onUpdateZoomLevel.bind(this);
  }

  componentDidMount () {
    this.map.zoomTo(this.state.zoomLevel, 4000);
  }

  onUpdateZoomLevel () {
    const nextZoomLevel = this.state.zoomLevel === 16 ? 1 : 16;
    this.setState({ zoomLevel: nextZoomLevel });
    this.map.zoomTo(nextZoomLevel, 4000);
  }

  render () {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
            zoomLevel={1}
            centerCoordinate={DEFAULT_CENTER_COORDINATE}
            onSetCameraComplete={this.onUpdateZoomLevel}
            ref={(ref) => this.map = ref}
            style={sheet.matchParent}
            styleURL={MapboxGL.StyleURL.Outside} />
      </Page>
    );
  }
}

export default YoYo;
