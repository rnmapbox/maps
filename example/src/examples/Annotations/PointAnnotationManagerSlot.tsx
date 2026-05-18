import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Camera,
  MapView,
  PointAnnotation,
  PointAnnotationManager,
} from '@rnmapbox/maps';
import { Button } from '@rneui/base';

import { ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

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
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
  },
});

const COORDS: [number, number][] = [
  [-74.00597, 40.71427],
  [-74.0065, 40.7128],
  [-74.0045, 40.7155],
];

const PointAnnotationManagerSlot = () => {
  const [slot, setSlot] = useState<string>('middle');

  return (
    <>
      <MapView style={styles.map} styleURL="mapbox://styles/mapbox/standard">
        <Camera
          defaultSettings={{
            centerCoordinate: [-74.00597, 40.71427],
            zoomLevel: 15,
            pitch: 45,
          }}
        />
        <PointAnnotationManager slot={slot}>
          {COORDS.map((coord, i) => (
            <PointAnnotation key={`pin-${i}`} id={`pin-${i}`} coordinate={coord}>
              <View style={[styles.pin, { backgroundColor: 'dodgerblue' }]}>
                <Text style={styles.label}>{i + 1}</Text>
              </View>
            </PointAnnotation>
          ))}
        </PointAnnotationManager>
      </MapView>
      <View style={styles.buttons}>
        <Button
          title="bottom"
          onPress={() => setSlot('bottom')}
          color={slot === 'bottom' ? 'primary' : 'grey'}
        />
        <Button
          title="middle"
          onPress={() => setSlot('middle')}
          color={slot === 'middle' ? 'primary' : 'grey'}
        />
        <Button
          title="top"
          onPress={() => setSlot('top')}
          color={slot === 'top' ? 'primary' : 'grey'}
        />
      </View>
    </>
  );
};

export default PointAnnotationManagerSlot;

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'PointAnnotationManager Slot',
  tags: ['PointAnnotationManager', 'PointAnnotation', 'slot'],
  docs: `
Demonstrates using PointAnnotationManager to position annotations
in different slots of the Mapbox Standard style.
  `,
};
PointAnnotationManagerSlot.metadata = metadata;
