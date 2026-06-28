import { Camera, MapView, MarkerView } from '@rnmapbox/maps';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const POSITIONS = Object.fromEntries([
  ['id1', [-1.202582, 43.36005] as [number, number]],
  ['id2', [-1.303701, 43.384357] as [number, number]],
]);

type Rider = {
  id: string;
  name: string;
  order: number;
};

const RIDERS: Rider[] = [
  { id: 'id2', name: 'Favorite Rider', order: 100 },
  { id: 'id1', name: 'Normal Rider', order: 10 },
];

export const Test = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, [number, number]>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(POSITIONS);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const labels = RIDERS.map(rider => ({
    ...rider,
    order: rider.id === selectedId ? 10000 : rider.order,
    selected: rider.id === selectedId,
  })).sort((a, b) => a.order - b.order);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        style={{ flex: 1 }}
        onPress={() => {
          if (Platform.OS !== 'web') setSelectedId(null);
        }}>
        <Camera centerCoordinate={[-1.21, 43.38]} zoomLevel={10} />

        {labels.map(label => {
          const position = positions[label.id];
          if (!position) return null;

          return (
            <MarkerView
              key={label.id}
              id={label.id}
              coordinate={position}
              anchor={{ x: 0, y: 1 }}
              allowOverlap={false}
              isSelected={label.selected}>
              <Pressable onPress={() => setSelectedId(label.id)}>
                <View
                  style={{
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: label.selected ? '#fff' : '#4CAF50',
                    backgroundColor: label.selected ? '#fff' : '#4CAF50',
                  }}
                  collapsable={false}>
                  <Text style={{ fontSize: 16, color: label.selected ? '#4CAF50' : '#fff' }}>
                    {label.name}
                  </Text>
                </View>
              </Pressable>
            </MarkerView>
          );
        })}
      </MapView>
    </View>
  );
};

export default Test;

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'MarkerView Disappear (Issue 4206)',
  tags: ['MarkerView', 'bug', 'isSelected'],
  docs: 'Exact reproducer from issue #4206: MarkerViews disappear on Android when width/height is 0 during addViewAnnotation.',
};
Test.metadata = metadata;
