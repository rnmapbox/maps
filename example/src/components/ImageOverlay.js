import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';

import sheet from '../styles/sheet';
import radarGIF from '../assets/radar.png';

class ImageOverlay extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  render () {
    const coordQuad = [
      [-80.425, 46.437], // top left
      [-71.516, 46.437], // top right
      [-71.516, 37.936], // bottom right
      [-80.425, 37.936], // bottom left
    ];

    return (
      <Page {...this.props}>
        <MapboxGL.MapView
            zoomLevel={5.2}
            centerCoordinate={[-75.789, 41.874]}
            ref={(ref) => this.map = ref}
            style={sheet.matchParent}
            styleURL={MapboxGL.StyleURL.Dark}>

            <MapboxGL.ImageSource id='radarSource' coordinates={coordQuad} url={radarGIF}>
              <MapboxGL.RasterLayer id='radarLayer' style={{ rasterOpacity: 1.0 }}/>
            </MapboxGL.ImageSource>

        </MapboxGL.MapView>
      </Page>
    );
  }
}

export default ImageOverlay;
