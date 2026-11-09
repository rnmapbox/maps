import { useCallback, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { type ExampleWithMetadata } from '../common/ExampleMetadata';

const FOCAL_POINT = { x: 100, y: 150 };
const MARKER_SIZE = 24;

const GestureFocalPoint = () => {
  const mapRef = useRef<Mapbox.MapView>(null);
  const [focalPointEnabled, setFocalPointEnabled] = useState(true);
  const [status, setStatus] = useState('');

  const handleMapIdle = useCallback(async (state: Mapbox.MapState) => {
    const coordinate = await mapRef.current?.getCoordinateFromView([
      FOCAL_POINT.x,
      FOCAL_POINT.y,
    ]);
    if (!coordinate) return;
    const [lon = 0, lat = 0] = coordinate;
    setStatus(
      `zoom ${state.properties.zoom.toFixed(
        2,
      )} · heading ${state.properties.heading.toFixed(0)}°\n` +
        `under marker: ${lon.toFixed(4)}, ${lat.toFixed(4)}`,
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <Mapbox.MapView
          ref={mapRef}
          testID="gesture-focal-point-map"
          style={StyleSheet.absoluteFill}
          gestureSettings={{
            focalPoint: focalPointEnabled ? FOCAL_POINT : undefined,
          }}
          onMapIdle={handleMapIdle}
        >
          <Mapbox.Camera
            defaultSettings={{
              centerCoordinate: [-73.9857, 40.7484],
              zoomLevel: 12,
            }}
          />
        </Mapbox.MapView>
        {focalPointEnabled && (
          <View pointerEvents="none" style={styles.marker} />
        )}
      </View>
      <View style={styles.controls}>
        <Text testID="gesture-focal-point-status">{status}</Text>
        <Button
          testID="gesture-focal-point-toggle"
          title={
            focalPointEnabled ? 'Disable focal point' : 'Enable focal point'
          }
          onPress={() => setFocalPointEnabled((enabled) => !enabled)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1 },
  marker: {
    position: 'absolute',
    left: FOCAL_POINT.x - MARKER_SIZE / 2,
    top: FOCAL_POINT.y - MARKER_SIZE / 2,
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    borderWidth: 3,
    borderColor: 'red',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  controls: { padding: 8, gap: 4 },
});

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Gesture Focal Point',
  tags: ['MapView#gestureSettings'],
  docs: `
Pinch, rotate and double-tap zoom pivot around the red marker instead of the touch location while \`gestureSettings.focalPoint\` is set. The coordinate under the marker stays the same across those gestures.
`,
};
GestureFocalPoint.metadata = metadata;

export default GestureFocalPoint;
