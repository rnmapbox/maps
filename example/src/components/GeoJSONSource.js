import React from 'react';
import MapboxGL from 'react-native-mapbox-gl';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';

import sheet from '../styles/sheet';
import { SF_OFFICE_COORDINATE } from '../utils';
import smileyFaceGeoJSON from '../assets/smiley_face.json';

const layerStyles = MapboxGL.StyleSheet.create({
  smileyFace: {
    fillAntialias: true,
    fillColor: 'white',
    fillOutlineColor: 'rgba(255, 255, 255, 0.84)',
  },
});

class GeoJSONSource extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  render () {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
            zoomLevel={2}
            centerCoordinate={[-35.15165038, 40.62357280]}
            onSetCameraComplete={this.onUpdateZoomLevel}
            ref={(ref) => this.map = ref}
            style={sheet.matchParent}
            styleURL={MapboxGL.StyleURL.Dark}>

            <MapboxGL.ShapeSource id='smileyFaceSource' shape={smileyFaceGeoJSON}>
              <MapboxGL.FillLayer id='smileyFaceFill' style={layerStyles.smileyFace} />
            </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
      </Page>
    );
  }
}

export default GeoJSONSource;
