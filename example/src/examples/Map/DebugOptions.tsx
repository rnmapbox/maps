import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, type DebugOption, MapView, StyleURL } from '@rnmapbox/maps';

import { type ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

const OPTIONS: DebugOption[] = [
  'tileBorders',
  'parseStatus',
  'collision',
  'overdraw',
  'camera',
  'padding',
  'terrainWireframe',
];

const STYLES = [StyleURL.Street, StyleURL.Dark];

const DebugOptions = () => {
  const [debugOptions, setDebugOptions] = useState<DebugOption[]>([
    'tileBorders',
  ]);
  const [styleIndex, setStyleIndex] = useState(0);

  const toggle = (option: DebugOption) =>
    setDebugOptions((current) =>
      current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option],
    );

  return (
    <>
      <View style={styles.chips}>
        {OPTIONS.map((option) => {
          const selected = debugOptions.includes(option);
          return (
            <TouchableOpacity
              key={option}
              testID={`debug-option-${option}`}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => toggle(option)}
            >
              <Text style={selected && styles.chipTextSelected}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.buttons}>
        <Button title="Clear" onPress={() => setDebugOptions([])} />
        <Button
          title="Switch style"
          onPress={() => setStyleIndex((i) => (i + 1) % STYLES.length)}
        />
      </View>
      <MapView
        style={styles.map}
        styleURL={STYLES[styleIndex]}
        debugOptions={debugOptions}
      >
        <Camera
          defaultSettings={{
            centerCoordinate: [-74.00597, 40.71427],
            zoomLevel: 13,
          }}
        />
      </MapView>
    </>
  );
};

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', padding: 4 },
  chip: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 2,
  },
  chipSelected: { backgroundColor: '#4264fb', borderColor: '#4264fb' },
  chipTextSelected: { color: 'white' },
  buttons: { flexDirection: 'row', justifyContent: 'space-around' },
  map: { flex: 1 },
});

export default DebugOptions;

/* end-example-doc */

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Debug Options',
  tags: ['MapView#debugOptions'],
  docs: `
Toggles the native debug drawings of the map, like tile borders and symbol collision boxes. \`terrainWireframe\` is Android only, iOS ignores it with a warning.
`,
  excludeFromPercy: true,
};
DebugOptions.metadata = metadata;
