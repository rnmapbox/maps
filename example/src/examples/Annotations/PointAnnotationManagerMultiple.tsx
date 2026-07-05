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
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { color: 'white', fontWeight: 'bold', fontSize: 11 },
});

// A grid of coordinates over a cluster of tall 3D buildings in Lower Manhattan.
const GRID: [number, number][] = [];
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 3; c++) {
    GRID.push([-74.0145 + c * 0.0018, 40.7085 + r * 0.0012]);
  }
}
const T_OFFSET = 0.0005;

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
          centerCoordinate: [-74.0115, 40.711],
          zoomLevel: 15.7,
          pitch: 62,
          heading: 25,
        }}
      />

      {/* Each manager owns its own layer in a different slot of the Standard style.
          The bottom-slot pins (B) are drawn under the 3D buildings, so the towers
          occlude them, while the top-slot pins (T) are drawn over everything. */}
      <PointAnnotationManager slot="bottom" iconAllowOverlap>
        {GRID.map((c, i) => pin(`b-${i}`, c, 'crimson', 'B'))}
      </PointAnnotationManager>

      <PointAnnotationManager slot="top" iconAllowOverlap>
        {GRID.map((c, i) => pin(`t-${i}`, [c[0] + T_OFFSET, c[1]], 'royalblue', 'T'))}
      </PointAnnotationManager>
    </MapView>
  );
};

export default PointAnnotationManagerMultiple;

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'PointAnnotationManager Multiple',
  tags: ['PointAnnotationManager', 'PointAnnotation', 'slot'],
  docs: `
Demonstrates multiple PointAnnotationManager instances, each owning its own
annotation layer in a different slot of the Mapbox Standard style. The bottom-slot
pins (B) render behind the 3D buildings while the top-slot pins (T) render in front.
  `,
};
PointAnnotationManagerMultiple.metadata = metadata;
