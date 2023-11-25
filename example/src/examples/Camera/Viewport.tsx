import React, { useRef } from 'react';
import { Button } from 'react-native';
import {
  MapView,
  Viewport,
  NativeUserLocation,
  ShapeSource,
  CircleLayer,
} from '@rnmapbox/maps';

const points: GeoJSON.Geometry = {
  type: 'GeometryCollection',
  geometries: [
    {
      type: 'Point',
      coordinates: [-73.9880595, 40.7738941],
    },
    {
      type: 'Point',
      coordinates: [-73.9881695, 40.7738741],
    },
  ],
};

export default function ViewportExample() {
  const viewport = useRef<Viewport>(null);

  return (
    <>
      <Button title="idle" onPress={() => viewport.current?.idle()} />
      <Button
        title="followPuck"
        onPress={async () => {
          const completed = await viewport.current?.transitionTo(
            {
              kind: 'followPuck',
              options: { zoom: 'keep', padding: { top: 200, left: 200 } },
            },
            { kind: 'default', maxDurationMs: 5000 },
          );
          console.log(' => transitionTo completed:', completed);
        }}
      />
      <Button
        title="overview"
        onPress={async () => {
          const completed = await viewport.current?.transitionTo(
            {
              kind: 'overview',
              options: {
                geometry: points,
                padding: { top: 200, left: 200, right: 20, bottom: 20 },
              },
            },
            { kind: 'default', maxDurationMs: 5000 },
          );
          console.log(' => transitionTo completed:', completed);
        }}
      />
      <Button
        title="getState"
        onPress={async () => {
          const state = await viewport.current?.getState();
          console.log('state is ', state, typeof state);
        }}
      />
      <MapView style={styles.matchParent}>
        <Viewport
          ref={viewport}
          onStatusChanged={(event: object) =>
            console.log(' => Viewport native event:', event, typeof event)
          }
        />
        <NativeUserLocation />
        <ShapeSource id="shape-source" shape={points}>
          <CircleLayer id="circle-layer" style={{ circleRadius: 10 }} />
        </ShapeSource>
      </MapView>
    </>
  );
}

const styles = {
  matchParent: {
    flex: 1,
  },
};
