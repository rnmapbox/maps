import { useState } from 'react';
import { Button, View } from 'react-native';
import {
  Camera,
  CircleLayer,
  LineLayer,
  MapView,
  ShapeSource,
} from '@rnmapbox/maps';

import { type ExampleWithMetadata } from '../common/ExampleMetadata';

const points: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    [-74.05, 40.68],
    [-74.0, 40.7],
    [-73.9, 40.75],
  ].map((coordinates, index) => ({
    type: 'Feature',
    properties: { size: 18 - index * 4 },
    geometry: { type: 'Point', coordinates },
  })),
};

const route: GeoJSON.Feature = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: [
      [-74.05, 40.68],
      [-74.0, 40.7],
      [-73.9, 40.75],
    ],
  },
};

function ShapeSourceLayers() {
  const [highlighted, setHighlighted] = useState(false);
  const [showRoute, setShowRoute] = useState(true);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row' }}>
        <Button
          title="Toggle color"
          onPress={() => setHighlighted(!highlighted)}
        />
        <Button title="Toggle route" onPress={() => setShowRoute(!showRoute)} />
      </View>
      <MapView style={{ flex: 1 }}>
        <Camera zoomLevel={10} centerCoordinate={[-73.98, 40.71]} />
        {showRoute && (
          <ShapeSource id="route" shape={route}>
            <LineLayer
              id="route-line"
              style={{ lineColor: 'orange', lineWidth: 6, lineCap: 'round' }}
            />
          </ShapeSource>
        )}
        <ShapeSource id="points" shape={points}>
          <CircleLayer
            id="points-circle"
            style={{
              circleColor: highlighted ? 'red' : 'blue',
              circleRadius: ['get', 'size'],
              circleStrokeWidth: 2,
              circleStrokeColor: 'white',
            }}
          />
        </ShapeSource>
      </MapView>
    </View>
  );
}

export default ShapeSourceLayers;

/* end-example-doc */

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'ShapeSource Layers',
  tags: ['ShapeSource', 'CircleLayer', 'LineLayer'],
  docs: `
Shows a ShapeSource with a CircleLayer and a LineLayer, and updates their style and visibility from state. Works on web too.
`,
};
(ShapeSourceLayers as unknown as ExampleWithMetadata).metadata = metadata;
