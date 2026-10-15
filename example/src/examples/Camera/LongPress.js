import React, { useEffect, useRef, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { Camera, MapView } from '@rnmapbox/maps';

const CENTER = [-0.15, 51.51];
const MODES = ['flyTo', 'easeTo', 'moveTo', 'moveBy', 'scaleBy', 'none'];

export default function LongPress() {
  const map = useRef();
  const camera = useRef();
  const timer = useRef();
  const gestureActive = useRef(false);
  const size = useRef({ width: 0, height: 0 });
  const [mode, setMode] = useState(0);
  const [result, setResult] = useState('Ready');

  useEffect(() => () => clearTimeout(timer.current), []);

  async function readCamera(target) {
    const [center, zoom] = await Promise.all([
      map.current.getCenter(),
      map.current.getZoom(),
    ]);
    setResult(
      JSON.stringify({
        target,
        center,
        zoom,
        gestureActive: gestureActive.current,
      }),
    );
  }

  function onLongPress(feature) {
    const target = feature.geometry.coordinates;
    const method = MODES[mode];
    const animation = { animationMode: 'easeTo', animationDuration: 1500 };
    if (method === 'flyTo') camera.current.flyTo(target, 1500);
    else if (method === 'moveBy')
      camera.current.moveBy({ x: 100, y: 0, ...animation });
    else if (method === 'scaleBy')
      camera.current.scaleBy({
        x: size.current.width / 2,
        y: size.current.height / 2,
        scaleFactor: 2,
        ...animation,
      });
    else if (method !== 'none')
      camera.current.setCamera({
        centerCoordinate: target,
        animationMode: method,
        animationDuration: method === 'moveTo' ? 0 : 1500,
      });
    clearTimeout(timer.current);
    // Sample after the animation finishes, while the regression test still holds its touch.
    timer.current = setTimeout(() => readCamera(target), 2200);
  }

  return (
    <View style={{ flex: 1, paddingTop: 64 }}>
      <Button
        title={`Mode: ${MODES[mode]}`}
        onPress={() => setMode((mode + 1) % MODES.length)}
      />
      <Button
        title="Reset camera"
        onPress={() => {
          clearTimeout(timer.current);
          camera.current.setCamera({
            centerCoordinate: CENTER,
            zoomLevel: 16,
            animationDuration: 0,
          });
          setResult('Ready');
        }}
      />
      <Button title="Read camera" onPress={() => readCamera()} />
      <Text testID="long-press-result" style={{ height: 80, fontSize: 10 }}>
        {result}
      </Text>
      <MapView
        testID="long-press-map"
        ref={map}
        style={{ flex: 1 }}
        onLayout={(event) => {
          size.current = event.nativeEvent.layout;
        }}
        onCameraChanged={(state) => {
          gestureActive.current = state.gestures.isGestureActive;
        }}
        onLongPress={onLongPress}
      >
        <Camera
          ref={camera}
          defaultSettings={{ centerCoordinate: CENTER, zoomLevel: 16 }}
        />
      </MapView>
    </View>
  );
}

/* end-example-doc */
LongPress.metadata = {
  title: 'Long Press Camera',
  tags: ['Camera', 'MapView#onLongPress'],
  docs: 'Move the camera during a held long press, then lift and pan again.',
  disableSync: true,
};
