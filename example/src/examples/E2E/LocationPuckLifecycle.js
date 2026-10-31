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
export default function LocationPuckLifecycle() {
  const map = useRef(null);
  const frames = useRef(0);
  const heading = useRef(0);
  const ready = useRef(false);
  const [follow, setFollow] = useState(false);
  const [tick, setTick] = useState(0);
  const [state, setState] = useState('{}');
  const coordinate = [origin[0] + tick * 0.00004, origin[1]];
  const targetHeading = follow ? 90 : (tick * 10) % 360;
  const current = useRef(null);
  current.current = { follow, locations: tick, coordinate, targetHeading };

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
        testID="puck-follow"
        title="Follow hidden"
        onPress={() => setFollow(true)}
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
          followUserLocation={follow}
          followUserMode="compass"
          followZoomLevel={16}
        />
        <Mapbox.CustomLocationProvider
          coordinate={coordinate}
          heading={targetHeading}
        />
        <Mapbox.LocationPuck
          visible={false}
          puckBearingEnabled
          puckBearing="heading"
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
