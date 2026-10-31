import { useEffect, useRef, useState } from 'react';
import { Button, Text, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

const origin = [-71.107, 42.337];
const camera = { centerCoordinate: origin, zoomLevel: 16 };
const styleJSON = JSON.stringify({
  version: 8,
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#d9e5da' },
    },
  ],
});
// A magenta pixel scaled into a square makes image restoration observable in screenshots.
const images = {
  'lifecycle-puck': {
    uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4AWP4z/D/PwAG/gL+/gUKLAAAAABJRU5ErkJggg==',
  },
};
const pulsing = { isEnabled: true, radius: 30, color: '#00ffff' };

export default function LocationPuckLifecycle() {
  const map = useRef(null);
  const frames = useRef(0);
  const heading = useRef(0);
  const ready = useRef(false);
  const [mode, setMode] = useState('hidden');
  const [pulseEnabled, setPulseEnabled] = useState(false);
  const [tick, setTick] = useState(0);
  const [state, setState] = useState('{}');
  const visible = mode === 'visible';
  const coordinate = visible ? origin : [origin[0] + tick * 0.00004, origin[1]];
  const targetHeading = visible ? 0 : (tick * 10) % 360;
  const current = useRef(null);
  current.current = { mode, locations: tick, coordinate, targetHeading };

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    const timer = setInterval(async () => {
      if (!ready.current || !map.current) return;
      const center = await map.current.getCenter();
      if (mounted) {
        setState(
          JSON.stringify({
            ...current.current,
            ready: true,
            frames: frames.current,
            center,
            heading: heading.current,
          }),
        );
      }
    }, 500);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Button
        testID="puck-hidden"
        title="Hidden"
        onPress={() => setMode('hidden')}
      />
      <Button
        testID="puck-follow"
        title="Follow hidden"
        onPress={() => setMode('follow')}
      />
      <Button
        testID="puck-compass"
        title="Compass hidden"
        onPress={() => setMode('compass')}
      />
      <Button
        testID="puck-visible"
        title="Show custom pulse"
        onPress={() => {
          setPulseEnabled(true);
          setMode('visible');
        }}
      />
      <Text
        testID="puck-state"
        accessibilityLabel={state}
        style={{ height: 140 }}
        numberOfLines={6}
      >
        {state}
      </Text>
      <Mapbox.MapView
        ref={map}
        testID="puck-map"
        style={{ flex: 1 }}
        styleJSON={styleJSON}
        onDidFinishLoadingMap={() => {
          ready.current = true;
        }}
        onDidFinishRenderingFrameFully={() => {
          frames.current += 1;
        }}
        onDidFinishRenderingFrame={() => {
          frames.current += 1;
        }}
        onCameraChanged={(event) => {
          heading.current = event.properties.heading;
        }}
      >
        <Mapbox.Camera
          defaultSettings={camera}
          followUserLocation={mode === 'follow' || mode === 'compass'}
          followUserMode={mode === 'compass' ? 'compass' : 'normal'}
          followZoomLevel={16}
        />
        <Mapbox.CustomLocationProvider
          coordinate={coordinate}
          heading={targetHeading}
        />
        <Mapbox.Images images={images} />
        <Mapbox.LocationPuck
          visible={visible}
          topImage="lifecycle-puck"
          scale={20}
          puckBearingEnabled
          puckBearing="heading"
          pulsing={pulseEnabled ? pulsing : undefined}
        />
      </Mapbox.MapView>
    </View>
  );
}

LocationPuckLifecycle.metadata = {
  title: 'Location Puck Lifecycle',
  disableSync: true,
  waitForMapIdle: false,
  excludeFromPercy: true,
};
