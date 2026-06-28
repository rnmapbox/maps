import { View, Text, StyleSheet } from 'react-native';
import {
  Camera,
  MapView,
  PointAnnotation,
  PointAnnotationManager,
} from '@rnmapbox/maps';

import type { ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

const styles = StyleSheet.create({
  map: { flex: 1 },
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { color: 'white', fontWeight: 'bold', fontSize: 12 },
});

const TOP_COORDS: [number, number][] = [
  [-74.00597, 40.71427],
  [-74.0065, 40.7128],
];

const BOTTOM_COORDS: [number, number][] = [
  [-74.0045, 40.7155],
  [-74.0035, 40.7138],
];

const pin = (id: string, coord: [number, number], color: string, n: number) => (
  <PointAnnotation key={id} id={id} coordinate={coord}>
    <View style={[styles.pin, { backgroundColor: color }]}>
      <Text style={styles.label}>{n}</Text>
    </View>
  </PointAnnotation>
);

const PointAnnotationManagerMultiple = () => {
  return (
    <MapView style={styles.map} styleURL="mapbox://styles/mapbox/standard">
      <Camera
        defaultSettings={{
          centerCoordinate: [-74.00597, 40.71427],
          zoomLevel: 15,
          pitch: 45,
        }}
      />

      {/* Default manager: configures the slot used by bare annotations below. */}
      <PointAnnotationManager default slot="middle" />

      {/* Bare annotation - attaches to the default manager above. */}
      {pin('bare', [-74.00597, 40.71427], 'dimgray', 0)}

      {/* Two managers in different slots, each with its own layer. */}
      <PointAnnotationManager slot="top" iconAllowOverlap>
        {TOP_COORDS.map((c, i) => pin(`top-${i}`, c, 'tomato', i + 1))}
      </PointAnnotationManager>

      <PointAnnotationManager slot="bottom">
        {BOTTOM_COORDS.map((c, i) => pin(`bottom-${i}`, c, 'dodgerblue', i + 1))}
      </PointAnnotationManager>
    </MapView>
  );
};

export default PointAnnotationManagerMultiple;

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'PointAnnotationManager Multiple',
  tags: ['PointAnnotationManager', 'PointAnnotation', 'slot', 'default'],
  docs: `
Demonstrates multiple PointAnnotationManager instances, each owning its own
annotation layer in a different slot, a \`default\` manager that configures the
slot used by bare PointAnnotations, and a bare PointAnnotation attaching to it.
  `,
};
PointAnnotationManagerMultiple.metadata = metadata;
