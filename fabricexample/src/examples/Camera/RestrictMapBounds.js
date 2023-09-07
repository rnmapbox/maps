import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import bboxPolygon from '@turf/bbox-polygon';

import sheet from '../../styles/sheet';
import Page from '../common/Page';

const boundsStyle = {
  fillColor: 'rgba(255, 255, 255, 0.1)',
  fillOutlineColor: 'white',
};

const bounds = {
  ne: [-4.265762, 51.054738],
  sw: [-5.760365, 49.947256],
};

const {ne, sw} = bounds;
const polygon = bboxPolygon([sw[0], sw[1], ne[0], ne[1]]);

const RestrictMapBounds = props => (
  <Page {...props}>
    <MapboxGL.MapView
      style={sheet.matchParent}
      styleURL={MapboxGL.StyleURL.SatelliteStreet}>
      <MapboxGL.Camera
        maxBounds={bounds}
        zoomLevel={7}
        centerCoordinate={[-4.744276, 50.361239]}
      />
      <MapboxGL.ShapeSource id="bounds" shape={polygon}>
        <MapboxGL.FillLayer id="boundsFill" style={boundsStyle} />
      </MapboxGL.ShapeSource>
    </MapboxGL.MapView>
  </Page>
);

export default RestrictMapBounds;
