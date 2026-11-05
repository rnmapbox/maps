import { useRef, useState } from 'react';
import { Button, View } from 'react-native';
import {
  Camera,
  CircleLayer,
  MapView,
  ShapeSource,
  StyleURL,
} from '@rnmapbox/maps';

import { type ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-example-doc

const POINTS_PER_ROW = 50;

const point = (index: number, heat: number): GeoJSON.Feature => ({
  type: 'Feature',
  id: `point-${index}`,
  properties: { heat },
  geometry: {
    type: 'Point',
    coordinates: [
      -5 + (index % POINTS_PER_ROW) * 0.2,
      -5 + Math.floor(index / POINTS_PER_ROW) * 0.2,
    ],
  },
});

const shape: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: Array.from(
    { length: POINTS_PER_ROW * POINTS_PER_ROW },
    (_, index) => point(index, 0),
  ),
};

const PartialFeatureUpdates = () => {
  const source = useRef<ShapeSource>(null);
  const [nextIndex, setNextIndex] = useState(shape.features.length);

  const update = () => {
    const indexes = new Set(
      Array.from({ length: 20 }, () =>
        Math.floor(Math.random() * shape.features.length),
      ),
    );
    source.current?.updateFeatures(
      [...indexes].map((index) => point(index, 1)),
    );
  };

  const add = () => {
    source.current?.addFeatures([point(nextIndex, 1)]);
    setNextIndex(nextIndex + 1);
  };

  const remove = () => {
    if (nextIndex > shape.features.length) {
      source.current?.removeFeatures([`point-${nextIndex - 1}`]);
      setNextIndex(nextIndex - 1);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} styleURL={StyleURL.Light}>
        <Camera defaultSettings={{ centerCoordinate: [0, 0], zoomLevel: 4 }} />
        <ShapeSource ref={source} id="points" shape={shape}>
          <CircleLayer
            id="points-circles"
            style={{
              circleRadius: 4,
              circleColor: ['match', ['get', 'heat'], 1, '#e8590c', '#1c7ed6'],
            }}
          />
        </ShapeSource>
      </MapView>
      <Button title="Update 20 points" onPress={update} />
      <Button title="Add a point" onPress={add} />
      <Button title="Remove the added point" onPress={remove} />
    </View>
  );
};

export default PartialFeatureUpdates;

/* end-example-doc */

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Partial feature updates',
  tags: [
    'ShapeSource',
    'ShapeSource#addFeatures',
    'ShapeSource#updateFeatures',
    'ShapeSource#removeFeatures',
    'CircleLayer',
  ],
  docs: `
Changes a few features of a large ShapeSource without resending its whole shape.

Every feature has an \`id\`, which \`updateFeatures\` and \`removeFeatures\` use to find it.
`,
};

(PartialFeatureUpdates as unknown as ExampleWithMetadata).metadata = metadata;
