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
import { Button } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lineString } from '@turf/helpers';
import bbox from '@turf/bbox';

import Page from '../common/Page';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';

Logger.setLogLevel('verbose');

const coordinates: Position[] = [
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
const line = lineString(coordinates);

const boundingBox = bbox(line);

const AnimatedPoint = memo((props: BaseExampleProps) => {
  const [startOffset, setStartOffset] = useState(0);
  const [endOffset, setEndOffset] = useState(0);

  const animator = useMemo(() => {
    return new __experimental.ChangeLineOffsetsShapeAnimator({
      coordinates,
      startOffset,
      endOffset,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bounds = useMemo(() => {
    return {
      ne: [boundingBox[0], boundingBox[1]],
      sw: [boundingBox[2], boundingBox[3]],
      paddingTop: 40,
      paddingBottom: 40,
      paddingLeft: 40,
      paddingRight: 40,
    };
  }, []);

  useEffect(() => {
    animator.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    animator.setStartOffset({
      offset: startOffset,
      durationMs: 1000,
    });
  }, [animator, startOffset]);

  useEffect(() => {
    animator.setEndOffset({
      offset: endOffset,
      durationMs: 1000,
    });
  }, [animator, endOffset]);

  const onPressStartOffsetButton = useCallback(() => {
    setStartOffset(Math.random() * 1000);
  }, []);

  const onPressEndOffsetButton = useCallback(() => {
    setEndOffset(Math.random() * 1000);
  }, []);

  return (
    <Page {...props}>
      <MapView style={{ flex: 1 }}>
        <Camera defaultSettings={{ bounds }} bounds={bounds} />
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
        <Button
          title={'Change start offset'}
          onPress={onPressStartOffsetButton}
        />
        <Button
          style={{ marginTop: 10 }}
          title={'Change end offset'}
          onPress={onPressEndOffsetButton}
        />
      </SafeAreaView>
    </Page>
  );
});

export default AnimatedPoint;
