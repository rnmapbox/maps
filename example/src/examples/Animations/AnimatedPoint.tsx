import {
  Camera,
  Logger,
  MapView,
  ShapeSource,
  CircleLayer,
  __experimental,
} from '@rnmapbox/maps';
import { Position } from 'geojson';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';

import Page from '../common/Page';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';

Logger.setLogLevel('verbose');

const basePosition: Position = [-83.53808787278204, 41.66430343748789];

const AnimatedPoint = memo((props: BaseExampleProps) => {
  const [offset, setOffset] = useState([0, 0]);

  const currentPosition = useMemo((): Position => {
    return [basePosition[0] + offset[0], basePosition[1] + offset[1]];
  }, [offset]);

  const animator = useMemo(() => {
    return new __experimental.MovePointShapeAnimator(currentPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    animator.moveTo({
      coordinate: currentPosition,
      durationMs: 1000,
    });
  }, [animator, currentPosition]);

  const onPressButton = useCallback(() => {
    setOffset([(Math.random() - 0.5) * 0.005, (Math.random() - 0.5) * 0.005]);
  }, []);

  return (
    <Page {...props}>
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
        <Button title={'Change position'} onPress={onPressButton} />
      </SafeAreaView>
    </Page>
  );
});

export default AnimatedPoint;
