import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Camera, MapView, MarkerView } from '@rnmapbox/maps';

const MARKERS = [
  { id: '1', coordinate: [0, 0] as [number, number] },
  { id: '2', coordinate: [1, 1] as [number, number] },
  { id: '3', coordinate: [-1, -1] as [number, number] },
];

const BugReportExample = () => {
  const [lastPressed, setLastPressed] = useState<string | null>(null);

  return (
    <>
      <View style={{ padding: 8, backgroundColor: '#eee' }}>
        <Text>
          Last pressed:{' '}
          <Text style={{ fontWeight: 'bold' }}>
            {lastPressed ?? '(none — tap a marker)'}
          </Text>
        </Text>
      </View>
      <MapView style={{ flex: 1 }} onPress={() => setLastPressed('MAP (not a marker)')}>
        <Camera centerCoordinate={[0, 0]} zoomLevel={4} animationMode="none" />
        {MARKERS.map((marker) => (
          <MarkerView
            key={marker.id}
            id={marker.id}
            coordinate={marker.coordinate}
            allowOverlap
          >
            <Pressable
              onPress={() => setLastPressed(`marker ${marker.id}`)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'tomato',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                {marker.id}
              </Text>
            </Pressable>
          </MarkerView>
        ))}
      </MapView>
    </>
  );
};

export default BugReportExample;
