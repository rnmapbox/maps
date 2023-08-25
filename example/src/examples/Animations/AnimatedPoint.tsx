import {
  Camera,
  Logger,
  MapView,
  ShapeSource,
  CircleLayer,
} from '@rnmapbox/maps';
import { Position } from 'geojson';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { point } from '@turf/helpers';
import { Button } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';

import Page from '../common/Page';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';

Logger.setLogLevel('verbose');

const position: Position = [-83.53808787278204, 41.66430343748789];

const AnimatedLine = memo((props: BaseExampleProps) => {
  const [offset, setOffset] = useState([0, 0]);

  const _point = useMemo(() => {
    const withOffset: Position = [
      position[0] + offset[0],
      position[1] + offset[1],
    ];
    return point(withOffset);
  }, [offset]);

  const onPressButton = useCallback(() => {
    setOffset([(Math.random() - 0.5) * 0.005, (Math.random() - 0.5) * 0.005]);
  }, []);

  return (
    <Page {...props}>
      <MapView style={{ flex: 1 }}>
        <Camera
          defaultSettings={{ centerCoordinate: position, zoomLevel: 14 }}
          centerCoordinate={position}
          zoomLevel={14}
        />
        <ShapeSource id={'line-shape'} shape={_point} animationDuration={500}>
          <CircleLayer
            id={'line-layer'}
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
        <Button title={'Change position'} onPress={onPressButton} />
      </SafeAreaView>
    </Page>
  );
});

export default AnimatedLine;
