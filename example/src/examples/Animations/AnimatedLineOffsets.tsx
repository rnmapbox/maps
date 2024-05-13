import { Button, StyleProp, View, ViewStyle } from 'react-native';
import {
  Camera,
  Logger,
  MapView,
  ShapeSource,
  __experimental,
  LineLayer,
} from '@rnmapbox/maps';
import { Position } from 'geojson';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Divider, Slider, Text } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lineString } from '@turf/helpers';
import bbox from '@turf/bbox';
import length from '@turf/length';

import type { ExampleWithMetadata } from '../common/ExampleMetadata';

Logger.setLogLevel('verbose');

const baseCoordinates: Position[] = [
  [-83.53808787278204, 41.66430343748789],
  [-83.53358035756604, 41.66640799713619],
  [-83.52969888612948, 41.66177787510651],
  [-83.51648936237063, 41.66809159532477],
  [-83.51467383540873, 41.66706273499676],
  [-83.51436081351842, 41.66519203773046],
  [-83.50891423263205, 41.657147420131764],
  [-83.51104278148429, 41.65625870887462],
  [-83.51805447182102, 41.65186174645257],
  [-83.51630154923672, 41.65017772390942],
  [-83.51592592296878, 41.645733564160906],
  [-83.51110538586248, 41.64582712857808],
  [-83.51104278148429, 41.64353476124876],
];

const maxDuration = 5000;

const randNorm = () => Math.random() - 0.5;

const AnimatedLineOffsets = memo(() => {
  const coordinates = useRef<Position[]>(baseCoordinates);
  const startOffset = useRef(0);
  const endOffset = useRef(0);
  const duration = useRef(1000);

  const [startOffsetState, setStartOffsetState] = useState(startOffset.current);
  const [endOffsetState, setEndOffsetState] = useState(endOffset.current);
  const [durationState, setDurationState] = useState(duration.current);

  const animator = useMemo(() => {
    return new __experimental.ChangeLineOffsetsShapeAnimator({
      coordinates: coordinates.current,
      startOffset: startOffset.current,
      endOffset: endOffset.current,
    });
  }, []);

  const lineLength = useMemo(() => {
    return length(lineString(coordinates.current), { units: 'meters' });
  }, []);

  const bounds = useMemo(() => {
    const boundingBox = bbox(lineString(coordinates.current));
    return {
      ne: [boundingBox[0], boundingBox[1]],
      sw: [boundingBox[2], boundingBox[3]],
      paddingTop: 20,
      paddingBottom: 320,
      paddingLeft: 20,
      paddingRight: 20,
    };
  }, []);

  const buildRandomizedLine = useCallback(() => {
    return baseCoordinates.map((c) => {
      return [c[0] + randNorm() * 0.001, c[1] + randNorm() * 0.001];
    });
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
          <Text>{'Randomize Line'}</Text>
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
          >
            <Button
              title={'Keep offsets'}
              onPress={() => {
                animator.setLineString({
                  coordinates: buildRandomizedLine(),
                  startOffset: undefined,
                  endOffset: undefined,
                });
              }}
            />
            <Button
              title={'Zero offsets'}
              onPress={() => {
                startOffset.current = 0;
                endOffset.current = 0;
                animator.setLineString({
                  coordinates: buildRandomizedLine(),
                  startOffset: startOffset.current,
                  endOffset: endOffset.current,
                });
                setStartOffsetState(startOffset.current);
                setEndOffsetState(endOffset.current);
              }}
            />
          </View>
        </View>

        <Divider style={{ marginVertical: 5 }} />

        <View>
          <View style={rowStyle}>
            <Text>{'Start Offset'}</Text>
            <Text>{startOffsetState.toFixed(2)} m</Text>
          </View>
          <Slider
            {...sliderProps}
            value={startOffsetState / lineLength}
            onSlidingComplete={(v) => {
              startOffset.current = v * lineLength;
              animator.setStartOffset({
                offset: startOffset.current,
                durationMs: duration.current,
              });
              setStartOffsetState(startOffset.current);
            }}
          />
        </View>

        <Divider style={{ marginVertical: 5 }} />

        <View>
          <View style={rowStyle}>
            <Text>{'End Offset'}</Text>
            <Text>{endOffsetState.toFixed(2)} m</Text>
          </View>
          <Slider
            {...sliderProps}
            value={endOffsetState / lineLength}
            onSlidingComplete={(v) => {
              endOffset.current = v * lineLength;
              animator.setEndOffset({
                offset: endOffset.current,
                durationMs: duration.current,
              });
              setEndOffsetState(endOffset.current);
            }}
          />
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
              animator.setStartOffset({
                offset: startOffset.current,
                durationMs: duration.current,
              });
              animator.setEndOffset({
                offset: endOffset.current,
                durationMs: duration.current,
              });
              setDurationState(duration.current);
            }}
          />
        </View>
      </View>
    );
  }, [
    startOffsetState,
    endOffsetState,
    durationState,
    lineLength,
    animator,
    buildRandomizedLine,
  ]);

  return (
    <>
      <MapView style={{ flex: 1 }}>
        <Camera
          defaultSettings={{ bounds }}
          bounds={bounds}
          animationDuration={1000}
        />
        <ShapeSource id={'line-shape'} shape={animator}>
          <LineLayer
            id={'line-layer'}
            style={{
              lineColor: 'blue',
              lineWidth: 6,
              lineJoin: 'round',
              lineCap: 'round',
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

export default AnimatedLineOffsets;

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'Animated Line Offset',
  tags: [],
  docs: `
Animated Line Offsets (Native Animator)
`,
};
(AnimatedLineOffsets as unknown as ExampleWithMetadata).metadata = metadata;
