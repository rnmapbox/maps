import { StyleProp, View, ViewStyle } from 'react-native';
import {
  Camera,
  Logger,
  MapView,
  ShapeSource,
  __experimental,
  LineLayer,
} from '@rnmapbox/maps';
import { Position } from 'geojson';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Divider, Slider, Text } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lineString } from '@turf/helpers';
import bbox from '@turf/bbox';
import length from '@turf/length';

import Page from '../common/Page';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';

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

const AnimatedLineOffsets = memo((props: BaseExampleProps) => {
  const [coordinates, setCoordinates] = useState<Position[]>(baseCoordinates);
  const [startOffset, setStartOffset] = useState(0);
  const [endOffset, setEndOffset] = useState(0);
  const [duration, setDuration] = useState(1000);

  const animator = useMemo(() => {
    return new __experimental.ChangeLineOffsetsShapeAnimator({
      coordinates,
      startOffset,
      endOffset,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const line = useMemo(() => {
    return lineString(coordinates);
  }, [coordinates]);

  const lineLength = useMemo(() => {
    return length(line, { units: 'meters' });
  }, [line]);

  const boundingBox = useMemo(() => bbox(line), [line]);

  const bounds = useMemo(() => {
    return {
      ne: [boundingBox[0], boundingBox[1]],
      sw: [boundingBox[2], boundingBox[3]],
      paddingTop: 20,
      paddingBottom: 320,
      paddingLeft: 20,
      paddingRight: 20,
    };
  }, [boundingBox]);

  useEffect(() => {
    animator.setLineString({
      coordinates,
    });
  }, [animator, coordinates]);

  useEffect(() => {
    animator.setStartOffset({
      offset: startOffset,
      durationMs: duration,
    });
  }, [animator, startOffset, duration]);

  useEffect(() => {
    animator.setEndOffset({
      offset: endOffset,
      durationMs: duration,
    });
  }, [animator, endOffset, duration]);

  const randomizeLine = useCallback(() => {
    const randomized = baseCoordinates.map((c) => {
      return [c[0] + randNorm() * 0.001, c[1] + randNorm() * 0.001];
    });
    setCoordinates(randomized);
  }, []);

  const sliderComponents = useMemo(() => {
    const rowStyle: StyleProp<ViewStyle> = {
      flex: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
    };

    const sliderProps = {
      thumbTintColor: 'black',
      thumbStyle: { width: 15, height: 15 },
    };

    return (
      <View
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 10,
          backgroundColor: 'white',
        }}
      >
        <View>
          <View style={rowStyle}>
            <Text>{'Start Offset'}</Text>
            <Text>{startOffset.toFixed(2)} m</Text>
          </View>
          <Slider
            {...sliderProps}
            value={startOffset / lineLength}
            onSlidingComplete={(v) => setStartOffset(v * lineLength)}
          />
        </View>

        <Divider style={{ marginVertical: 10 }} />

        <View>
          <View style={rowStyle}>
            <Text>{'End Offset'}</Text>
            <Text>{endOffset.toFixed(2)} m</Text>
          </View>
          <Slider
            {...sliderProps}
            value={endOffset / lineLength}
            onSlidingComplete={(v) => setEndOffset(v * lineLength)}
          />
        </View>

        <Divider style={{ marginVertical: 10 }} />

        <View>
          <View style={rowStyle}>
            <Text>{'Duration'}</Text>
            <Text>{(duration / 1000).toFixed(2)} s</Text>
          </View>
          <Slider
            {...sliderProps}
            value={duration / maxDuration}
            onSlidingComplete={(v) => setDuration(v * maxDuration)}
          />
        </View>

        <Button
          style={{ marginTop: 5 }}
          title={'Randomize line'}
          onPress={() => randomizeLine()}
        />
      </View>
    );
  }, [startOffset, lineLength, endOffset, duration, randomizeLine]);

  return (
    <Page {...props}>
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
        {sliderComponents}
      </SafeAreaView>
    </Page>
  );
});

export default AnimatedLineOffsets;
