import { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import {
  MapView,
  Camera,
  CameraGestureObserver,
  type OnMapSteadyEvent,
  type OnMapCameraChangeEvent,
} from '@rnmapbox/maps';

import { type ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc
import type { CameraRef } from '../../../../src/components/Camera';

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
  sectionSpacing: {
    marginTop: 12,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

const defaultCameraCoordinate = [-74.006, 40.7128]; // New York City

const CameraGestureObserverExample = () => {
  const mapCameraRef = useRef<CameraRef>(null);
  const [status, setStatus] = useState('Waiting for interaction...');
  const [cameraStatus, setCameraStatus] = useState('No camera changes yet');
  const [autoRecenter, setAutoRecenter] = useState(true);

  const onMapCameraChange = useCallback(
    ({ nativeEvent }: { nativeEvent: OnMapCameraChangeEvent }) => {
      const { properties, isUserInteraction, timestamp } = nativeEvent;
      const { center, zoom, heading, pitch } = properties;

      const [longitude = 0, latitude = 0] = center;
      let message = `Center: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      message += `\nZoom: ${zoom.toFixed(2)}`;
      message += `\nHeading: ${heading.toFixed(1)}°  Pitch: ${pitch.toFixed(
        1,
      )}°`;
      message += `\nUser interaction: ${isUserInteraction ? 'yes' : 'no'}`;

      if (timestamp !== undefined) {
        message += `\nTime: ${new Date(timestamp).toLocaleTimeString()}`;
      }

      console.log('[CameraGestureObserver] cameraChange', nativeEvent);
      setCameraStatus(message);
    },
    [],
  );

  const onMapSteady = useCallback(
    ({ nativeEvent }: { nativeEvent: OnMapSteadyEvent }) => {
      const { reason, idleDurationMs, lastGestureType, timestamp } =
        nativeEvent;

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
    },
    [],
  );

  useEffect(() => {
    // Re-center the map every 5 seconds. When this is done, isUserInteraction should log as false (but it doesn't when locationPuck is true)
    const interval = setInterval(() => {
      if (!mapCameraRef.current || !autoRecenter) {
        return;
      }

      mapCameraRef.current?.setCamera({
        centerCoordinate: defaultCameraCoordinate,
        animationDuration: 1000,
        animationMode: 'linearTo',
      });
    }, 5_000);

    return () => {
      clearInterval(interval);
    };
  }, [autoRecenter]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        <Camera
          ref={mapCameraRef}
          defaultSettings={{
            centerCoordinate: defaultCameraCoordinate,
            zoomLevel: 12,
          }}
        />
        <CameraGestureObserver
          quietPeriodMs={200}
          maxIntervalMs={5000}
          onMapSteady={onMapSteady}
          onMapCameraChange={onMapCameraChange}
        />
      </MapView>
      <View style={styles.statusBar}>
        <Text style={styles.title}>Map Steady State</Text>
        <Text style={styles.statusText}>{status}</Text>
        <Text style={[styles.title, styles.sectionSpacing]}>Camera</Text>
        <Text style={styles.statusText}>{cameraStatus}</Text>
        <Text style={styles.hint}>
          Pan, zoom, or rotate the map to see the steady state detection
        </Text>
        <Button
          title={`Auto recenter: ${autoRecenter ? 'On' : 'Off'}`}
          onPress={() => setAutoRecenter((prev) => !prev)}
        />
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
    'CameraGestureObserver#onMapCameraChange',
    'CameraGestureObserver#quietPeriodMs',
    'CameraGestureObserver#maxIntervalMs',
  ],
  docs: `
Demonstrates how to detect when the map becomes steady after user gestures (pan, zoom, rotate). The CameraGestureObserver component fires the onMapSteady event after a configurable quiet period, providing information about the last gesture type and idle duration. It also fires the onMapCameraChange event on every camera change, reporting the current center, zoom, heading, pitch, and whether the change came from user interaction.
`,
};
CameraGestureObserverExample.metadata = metadata;
