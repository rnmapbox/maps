import { useCallback, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MapView, Camera, CameraGestureObserver, type OnMapSteadyEvent } from '@rnmapbox/maps';

import { ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  statusBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

const CameraGestureObserverExample = () => {
  const [status, setStatus] = useState('Waiting for interaction...');

  const onMapSteady = useCallback(({ nativeEvent } : { nativeEvent: OnMapSteadyEvent }) => {
    const { reason, idleDurationMs, lastGestureType, timestamp } = nativeEvent;

    let message = `✓ Map is steady!\n\nReason: ${reason}`;

    if (reason === 'steady' && idleDurationMs !== undefined) {
      message += `\nIdle duration: ${Math.round(idleDurationMs)}ms`;
    }

    if (lastGestureType) {
      message += `\nLast gesture: ${lastGestureType}`;
    }

    message += `\nTime: ${new Date(timestamp).toLocaleTimeString()}`;

    console.log('[CameraGestureObserver]', nativeEvent);
    setStatus(message);
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        <Camera
          defaultSettings={{
            centerCoordinate: [-74.006, 40.7128],
            zoomLevel: 12,
          }}
        />
        <CameraGestureObserver
          quietPeriodMs={200}
          maxIntervalMs={5000}
          onMapSteady={onMapSteady}
        />
      </MapView>
      <View style={styles.statusBar}>
        <Text style={styles.title}>Map Steady State</Text>
        <Text style={styles.statusText}>{status}</Text>
        <Text style={styles.hint}>
          Pan, zoom, or rotate the map to see the steady state detection
        </Text>
      </View>
    </View>
  );
};

export default CameraGestureObserverExample;

/* end-example-doc */

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Camera Gesture Observer',
  tags: [
    'CameraGestureObserver#onMapSteady',
    'CameraGestureObserver#quietPeriodMs',
    'CameraGestureObserver#maxIntervalMs',
  ],
  docs: `
Demonstrates how to detect when the map becomes steady after user gestures (pan, zoom, rotate). The CameraGestureObserver component fires the onMapSteady event after a configurable quiet period, providing information about the last gesture type and idle duration.
`,
};
CameraGestureObserverExample.metadata = metadata;
