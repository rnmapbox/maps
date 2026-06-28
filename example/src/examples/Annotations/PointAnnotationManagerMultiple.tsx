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
  [-74.0105, 40.7155],
  [-74.0015, 40.7155],
];

const BOTTOM_COORDS: [number, number][] = [
  [-74.0105, 40.7115],
  [-74.0015, 40.7115],
];

const pin = (
  id: string,
  coord: [number, number],
  color: string,
  label: string,
) => (
  <PointAnnotation key={id} id={id} coordinate={coord}>
    <View style={[styles.pin, { backgroundColor: color }]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  </PointAnnotation>
);

const PointAnnotationManagerMultiple = () => {
  return (
    <MapView style={styles.map} styleURL="mapbox://styles/mapbox/standard">
      <Camera
        defaultSettings={{
          centerCoordinate: [-74.006, 40.7135],
          zoomLevel: 14,
          pitch: 0,
        }}
      />

      {/* Default manager: configures the slot used by bare annotations below. */}
      <PointAnnotationManager default slot="middle" />

      {/* Bare annotation (gray "D") - attaches to the default manager above. */}
      {pin('bare', [-74.006, 40.7135], 'dimgray', 'D')}

      {/* Two managers in different slots, each with its own layer. */}
      <PointAnnotationManager slot="top" iconAllowOverlap>
        {TOP_COORDS.map((c, i) => pin(`top-${i}`, c, 'tomato', `T${i + 1}`))}
      </PointAnnotationManager>

      <PointAnnotationManager slot="bottom">
        {BOTTOM_COORDS.map((c, i) =>
          pin(`bottom-${i}`, c, 'dodgerblue', `B${i + 1}`),
        )}
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
