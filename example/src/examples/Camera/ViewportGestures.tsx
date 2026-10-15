import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import {
  CustomLocationProvider,
  LocationPuck,
  MapView,
  Viewport,
  type MapState,
} from '@rnmapbox/maps';

import { type ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-example-doc

type Gesture = 'pan' | 'pinch' | 'doubleTap' | 'rotate' | 'pitch';
const GESTURES: Gesture[] = ['pan', 'pinch', 'doubleTap', 'rotate', 'pitch'];

type Mode = 'true' | 'false' | 'object';
const MODES: Mode[] = ['true', 'false', 'object'];

const START: [number, number] = [19.0402, 47.4979];
// about 15 m/s eastwards
const STEP_DEGREES = 0.0002;

function useSimulatedLocation(): [number, number] {
  const [coordinate, setCoordinate] = useState(START);
  useEffect(() => {
    const timer = setInterval(() => {
      setCoordinate(([lng, lat]) => [lng + STEP_DEGREES, lat]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return coordinate;
}

// native also reports `{ kind: 'state', state }` once a transition has finished
function describeStatus(status: {
  kind: string;
  state?: { kind: string };
  toState?: { kind: string };
}): string {
  const state = status.state ?? status.toState;
  return state ? `${status.kind} ${state.kind}` : status.kind;
}

const ViewportGestures = () => {
  const viewport = useRef<Viewport>(null);
  const coordinate = useSimulatedLocation();
  const [mode, setMode] = useState<Mode>('object');
  const [idleOn, setIdleOn] = useState<Record<Gesture, boolean>>({
    pan: true,
    pinch: false,
    doubleTap: false,
    rotate: false,
    pitch: false,
  });
  const [status, setStatus] = useState('idle');
  const [events, setEvents] = useState<string[]>([]);
  const [camera, setCamera] = useState('');

  const transitionsToIdle =
    mode === 'object' ? idleOn : mode === 'true' ? true : false;

  const log = (line: string) =>
    setEvents((previous) => [line, ...previous].slice(0, 4));

  const follow = () =>
    viewport.current?.transitionTo(
      { kind: 'followPuck', options: { zoom: 16, bearing: 0, pitch: 0 } },
      { kind: 'immediate' },
    );

  return (
    <View style={styles.matchParent}>
      <View style={styles.row}>
        {MODES.map((value) => (
          <Button
            key={value}
            title={mode === value ? `[${value}]` : value}
            onPress={() => setMode(value)}
          />
        ))}
        <Button title="follow" onPress={follow} />
      </View>
      {mode === 'object' && (
        <View style={styles.row}>
          {GESTURES.map((gesture) => (
            <Button
              key={gesture}
              title={`${gesture}:${idleOn[gesture] ? 'idle' : 'keep'}`}
              onPress={() =>
                setIdleOn((previous) => ({
                  ...previous,
                  [gesture]: !previous[gesture],
                }))
              }
            />
          ))}
        </View>
      )}
      <View style={styles.readout}>
        <Text testID="viewport-status">status: {status}</Text>
        <Text testID="viewport-camera">{camera}</Text>
        {events.map((event, index) => (
          <Text key={index} style={styles.event}>
            {event}
          </Text>
        ))}
      </View>
      <MapView
        style={styles.matchParent}
        onCameraChanged={(state: MapState) => {
          const { zoom, heading, pitch } = state.properties;
          const gesture = state.gestures.isGestureActive ? ' gesture' : '';
          setCamera(
            `zoom ${zoom.toFixed(2)} bearing ${heading.toFixed(0)} pitch ${pitch.toFixed(0)}${gesture}`,
          );
        }}
      >
        <Viewport
          ref={viewport}
          transitionsToIdleUponUserInteraction={transitionsToIdle}
          onStatusChanged={({ to, reason }) => {
            setStatus(describeStatus(to));
            log(`${describeStatus(to)} (${reason})`);
          }}
        />
        <CustomLocationProvider coordinate={coordinate} heading={90} />
        <LocationPuck />
      </MapView>
    </View>
  );
};

export default ViewportGestures;

/* end-example-doc */

const styles = StyleSheet.create({
  matchParent: { flex: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  readout: { padding: 4 },
  event: { fontSize: 11 },
});

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Viewport Gestures',
  tags: ['Viewport', 'Viewport#transitionsToIdleUponUserInteraction'],
  docs: `
Follows a simulated moving location, and chooses which gestures stop following with \`transitionsToIdleUponUserInteraction\`.

In the object form, pan stops following, while zooming, rotating and pitching keep following and keep the user's value.
`,
  disableSync: true,
};
ViewportGestures.metadata = metadata;
