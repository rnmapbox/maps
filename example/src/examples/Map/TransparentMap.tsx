import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  CircleLayer,
  MapView,
  ShapeSource,
  StyleURL,
} from '@rnmapbox/maps';
import { Button } from '@rneui/base';

import type { ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

const STRIPES = ['#ff00ff', '#00ff00', '#ffff00', '#00ffff', '#ff8800'];

const backgroundStyle = (backgroundColor: string) =>
  JSON.stringify({
    version: 8,
    name: 'transparent-background',
    sources: {},
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': backgroundColor },
      },
    ],
  });

const STYLES = [
  { label: 'Transparent', styleJSON: backgroundStyle('rgba(0,0,0,0)') },
  { label: '50% blue', styleJSON: backgroundStyle('rgba(0,0,255,0.5)') },
  { label: 'Streets', styleURL: StyleURL.Street },
];

const points: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    [-20, 10],
    [0, -10],
    [20, 10],
  ].map((coordinates) => ({
    type: 'Feature',
    properties: {},
    geometry: { type: 'Point', coordinates },
  })),
};

const TransparentMap = () => {
  const [transparent, setTransparent] = useState(true);
  const [styleIndex, setStyleIndex] = useState(0);
  const { styleJSON, styleURL } = STYLES[styleIndex]!;

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        {STRIPES.map((color) => (
          <View
            key={color}
            style={[styles.stripe, { backgroundColor: color }]}
          />
        ))}
      </View>
      <MapView
        style={styles.map}
        transparent={transparent}
        styleJSON={styleJSON}
        styleURL={styleURL}
      >
        <Camera defaultSettings={{ centerCoordinate: [0, 0], zoomLevel: 1 }} />
        <ShapeSource id="points" shape={points}>
          <CircleLayer
            id="points"
            style={{
              circleRadius: 16,
              circleColor: 'white',
              circleStrokeWidth: 3,
            }}
          />
        </ShapeSource>
      </MapView>
      <View style={styles.controls}>
        <Text style={styles.label}>
          {`transparent: ${transparent}, style: ${STYLES[styleIndex]!.label}`}
        </Text>
        <View style={styles.buttons}>
          <Button
            title={transparent ? 'Make opaque' : 'Make transparent'}
            onPress={() => setTransparent(!transparent)}
          />
          <Button
            title="Next style"
            onPress={() => setStyleIndex((styleIndex + 1) % STYLES.length)}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  stripe: { flex: 1 },
  map: { flex: 1 },
  controls: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  label: { marginBottom: 8 },
  buttons: { flexDirection: 'row', justifyContent: 'space-around' },
});

export default TransparentMap;

/* end-example-doc */

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Transparent Map',
  tags: ['MapView#transparent'],
  docs: `
Renders the map over coloured stripes. With \`transparent\` on, the stripes show through wherever the style's background is transparent or semi-transparent; the Streets style stays opaque.

On Android \`transparent\` is applied when the map is created, so toggling it here has no effect until the screen is reopened.
`,
  webSupported: true,
};
TransparentMap.metadata = metadata;
