import {
  Camera,
  Logger,
  MapView,
  ShapeSource,
  LineLayer,
} from '@rnmapbox/maps';
import { Position } from 'geojson';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { lineString } from '@turf/helpers';
import bbox from '@turf/bbox';
import { Button } from '@rneui/base';
import length from '@turf/length';
import { SafeAreaView } from 'react-native-safe-area-context';

import Page from '../common/Page';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';

Logger.setLogLevel('verbose');

const positions: Position[] = [
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
const line = lineString(positions);

const boundingBox = bbox(line);

const AnimatedLine = memo((props: BaseExampleProps) => {
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

  const [startOffset, setStartOffset] = useState(0);

  const onPressButton = useCallback(() => {
    const meters = length(line, { units: 'meters' });
    setStartOffset(Math.random() * meters);
  }, []);

  return (
    <Page {...props}>
      <MapView style={{ flex: 1 }}>
        <Camera defaultSettings={{ bounds }} bounds={bounds} />
        <ShapeSource
          id={'line-shape'}
          shape={line}
          animationDuration={2000}
          lineStartOffset={startOffset}
          lineEndOffset={0}
        >
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
      >
        <Button title={'Change line offset'} onPress={onPressButton} />
      </SafeAreaView>
    </Page>
  );
});

export default AnimatedLine;
