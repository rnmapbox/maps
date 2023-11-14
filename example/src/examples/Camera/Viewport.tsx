import React, { useRef } from 'react';
import { Button } from 'react-native';
import { MapView, Viewport, NativeUserLocation } from '@rnmapbox/maps';

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
      </MapView>
    </>
  );
}

const styles = {
  matchParent: {
    flex: 1,
  },
};
