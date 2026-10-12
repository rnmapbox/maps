import React, { useState } from 'react';
import { Text } from 'react-native';
import {
  MapView,
  Camera,
  ShapeSource,
  FillLayer,
  StyleURL,
} from '@rnmapbox/maps';
import bboxPolygon from '@turf/bbox-polygon';

import sheet from '../../styles/sheet';
import Bubble from '../common/Bubble';

const boundsStyle = {
  fillColor: 'rgba(255, 255, 255, 0.1)',
  fillOutlineColor: 'white',
};

const bounds = {
  ne: [-4.265762, 51.054738],
  sw: [-5.760365, 49.947256],
};

const { ne, sw } = bounds;
const polygon = bboxPolygon([sw[0], sw[1], ne[0], ne[1]]);

const RestrictMapBounds = (props) => {
  const [restrictBounds, setRestrictBounds] = useState(true);
  return (
    <>
      <MapView style={sheet.matchParent} styleURL={StyleURL.SatelliteStreet}>
        <Camera
          maxBounds={restrictBounds ? bounds : null}
          zoomLevel={7}
          centerCoordinate={[-4.744276, 50.361239]}
        />
        <ShapeSource id="bounds" shape={polygon}>
          <FillLayer id="boundsFill" style={boundsStyle} />
        </ShapeSource>
      </MapView>
      <Bubble onPress={() => setRestrictBounds(!restrictBounds)}>
        <Text>{restrictBounds ? 'Remove bounds' : 'Restrict bounds'}</Text>
      </Bubble>
    </>
  );
};

export default RestrictMapBounds;
