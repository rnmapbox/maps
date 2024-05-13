import {
  Camera,
  Logger,
  MapView,
  ShapeSource,
  CircleLayer,
  __experimental,
} from '@rnmapbox/maps';
import { Position } from 'geojson';
import React, { memo, useMemo, useRef, useState } from 'react';
import { Divider, Slider, Text } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Button, StyleProp, ViewStyle } from 'react-native';

import type { ExampleWithMetadata } from '../common/ExampleMetadata';

Logger.setLogLevel('verbose');

const basePosition: Position = [-83.53808787278204, 41.66430343748789];

const maxDuration = 5000;

const AnimatedPoint = memo(() => {
  const currentPosition = useRef<Position>([0, 0]);
  const duration = useRef(1000);

  const [durationState, setDurationState] = useState(duration.current);

  const animator = useMemo(() => {
    return new __experimental.MovePointShapeAnimator(basePosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contents = useMemo(() => {
    const rowStyle: StyleProp<ViewStyle> = {
      flex: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
    };

    const sliderProps = {
      thumbTintColor: 'black',
      thumbStyle: { width: 10, height: 10 },
    };

    return (
      <View>
        <View>
          <Text>{'Randomize Position'}</Text>
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
          >
            <Button
              title={'Randomize'}
              onPress={() => {
                const nextPosition = [
                  basePosition[0] + (Math.random() - 0.5) * 0.005,
                  basePosition[1] + (Math.random() - 0.5) * 0.005,
                ];
                currentPosition.current = nextPosition;
                animator.moveTo({
                  coordinate: currentPosition.current,
                  durationMs: duration.current,
                });
              }}
            />
          </View>
        </View>

        <Divider style={{ marginVertical: 5 }} />

        <View>
          <View style={rowStyle}>
            <Text>{'Duration'}</Text>
            <Text>{(durationState / 1000).toFixed(2)} s</Text>
          </View>
          <Slider
            {...sliderProps}
            value={durationState / maxDuration}
            onSlidingComplete={(v) => {
              duration.current = v * maxDuration;
              animator.moveTo({
                coordinate: currentPosition.current,
                durationMs: duration.current,
              });
              setDurationState(duration.current);
            }}
          />
        </View>
      </View>
    );
  }, [durationState, animator]);

  return (
    <>
      <MapView style={{ flex: 1 }}>
        <Camera
          defaultSettings={{ centerCoordinate: basePosition, zoomLevel: 15 }}
          centerCoordinate={basePosition}
          zoomLevel={15}
        />
        <ShapeSource id={'point-shape'} shape={animator}>
          <CircleLayer
            id={'point-layer'}
            style={{
              circleColor: 'blue',
              circleRadius: 10,
            }}
          />
        </ShapeSource>
      </MapView>
      <SafeAreaView
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          flex: 1,
          justifyContent: 'flex-end',
          paddingHorizontal: 10,
        }}
        pointerEvents={'box-none'}
      >
        <View
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 10,
            backgroundColor: 'white',
          }}
        >
          {contents}
        </View>
      </SafeAreaView>
    </>
  );
});

export default AnimatedPoint;

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'Animaated point',
  tags: [],
  docs: `
Animated Point (Native Animator)
`,
};
(AnimatedPoint as unknown as ExampleWithMetadata).metadata = metadata;
