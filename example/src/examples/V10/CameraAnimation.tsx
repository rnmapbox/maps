import React, { useMemo, useState } from 'react';
import { Button, SafeAreaView, StyleSheet, View } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
const { MapView, ShapeSource, CircleLayer } = MapboxGL;
import bbox from '@turf/bbox';
import { Feature, LineString, Point, Position } from '@turf/helpers';
import { Text, Divider } from 'react-native-elements';

import { Camera, CameraProps, AnimationMode } from '../../../../javascript';
import Page from '../common/Page';
import colors from '../../styles/colors';

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },

  sheet: {
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  content: {
    padding: 10,
  },
  buttonRow: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  divider: {
    marginVertical: 10,
  },
  fadedText: {
    color: 'gray',
  },
});

const mapStyles = {
  circle: {
    circleRadius: 6,
    circleColor: colors.primary.blue,
  },
};

const zeroPadding = {
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
};
const evenPadding = {
  paddingTop: 40,
  paddingBottom: 40,
  paddingLeft: 40,
  paddingRight: 40,
};
const minZoomLevel = 8;
const maxZoomLevel = 16;

const randPadding = () => {
  const randNum = () => {
    const items = [0, 150, 300];
    return items[Math.floor(Math.random() * items.length)];
  };

  return {
    paddingTop: randNum(),
    paddingBottom: randNum(),
    paddingLeft: randNum(),
    paddingRight: randNum(),
  };
};

const CameraAnimation = (props: any) => {
  const initialPosition = [-73.984638, 40.759211];

  const [animationMode, setAnimationMode] = useState<AnimationMode>('moveTo');
  const [positions, setPositions] = useState([initialPosition]);
  const [padding, setPadding] = useState(zeroPadding);

  const paddingDisplay = useMemo(() => {
    return `L ${padding.paddingLeft} | R ${padding.paddingRight} | T ${padding.paddingTop} | B ${padding.paddingBottom}`;
  }, [padding]);

  const move = (
    _animationMode: AnimationMode,
    shouldCreateMultiple: boolean,
  ) => {
    setAnimationMode(_animationMode);

    if (shouldCreateMultiple) {
      const _centerPosition = [
        initialPosition[0] + Math.random() * 0.2,
        initialPosition[1] + Math.random() * 0.2,
      ];
      const _positions = Array(10)
        .fill(0)
        .map((_) => {
          return [
            _centerPosition[0] + Math.random() * 0.2,
            _centerPosition[1] + Math.random() * 0.2,
          ];
        });
      setPositions(_positions);
    } else {
      setPositions([
        [
          initialPosition[0] + Math.random() * 0.2,
          initialPosition[1] + Math.random() * 0.2,
        ],
      ]);
    }
  };

  const features = useMemo((): Feature<Point>[] => {
    return positions.map((p: Position) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: p,
        },
        properties: {},
      };
    });
  }, [positions]);

  const centerOrBounds = useMemo((): Pick<
    CameraProps,
    'centerCoordinate' | 'bounds'
  > => {
    if (positions.length === 1) {
      return {
        centerCoordinate: positions[0],
      };
    } else {
      console.log('pos:', positions);

      const lineString: Feature<LineString> = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: positions,
        },
        properties: {},
      };
      const _bbox = bbox(lineString);
      return {
        bounds: {
          ne: [_bbox[0], _bbox[1]],
          sw: [_bbox[2], _bbox[3]],
        },
      };
    }
  }, [positions]);

  const locationDisplay = useMemo(() => {
    if (positions.length > 1) {
      const ne = centerOrBounds.bounds?.ne.map((n) => n.toFixed(3));
      const sw = centerOrBounds.bounds?.sw.map((n) => n.toFixed(3));
      return `ne ${ne} | sw ${sw}`;
    } else if (positions.length === 1) {
      const position = positions[0];
      const lon = position[0].toFixed(4);
      const lat = position[1].toFixed(4);
      return `lon ${lon} | lat ${lat}`;
    }
  }, [positions, centerOrBounds]);

  return (
    <Page {...props}>
      <MapView style={styles.map}>
        <Camera
          {...centerOrBounds}
          zoomLevel={12}
          minZoomLevel={minZoomLevel}
          maxZoomLevel={maxZoomLevel}
          padding={padding}
          animationDuration={800}
          animationMode={animationMode}
        />

        {features.map((f) => {
          const id = JSON.stringify(f.geometry.coordinates);
          return (
            <ShapeSource key={id} id={`source-${id}`} shape={f}>
              <CircleLayer id={`layer-${id}`} style={mapStyles.circle} />
            </ShapeSource>
          );
        })}
      </MapView>

      <SafeAreaView>
        <View style={styles.sheet}>
          <View style={styles.content}>
            <Text style={styles.fadedText}>centerCoordinate</Text>
            <View style={styles.buttonRow}>
              <Button title="Flight" onPress={() => move('flyTo', false)} />
              <Button title="Ease" onPress={() => move('easeTo', false)} />
              <Button title="Linear" onPress={() => move('linearTo', false)} />
              <Button title="Instant" onPress={() => move('moveTo', false)} />
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.fadedText}>bounds</Text>
            <View style={styles.buttonRow}>
              <Button title="Flight" onPress={() => move('flyTo', true)} />
              <Button title="Ease" onPress={() => move('easeTo', true)} />
              <Button title="Linear" onPress={() => move('linearTo', true)} />
              <Button title="Instant" onPress={() => move('moveTo', true)} />
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.fadedText}>padding</Text>
            <View style={styles.buttonRow}>
              <Button
                title="Zero"
                onPress={() => {
                  setPadding(zeroPadding);
                }}
              />
              <Button
                title="Even"
                onPress={() => {
                  setPadding(evenPadding);
                }}
              />
              <Button
                title="Random"
                onPress={() => {
                  setPadding(randPadding());
                }}
              />
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.fadedText}>info</Text>
            <Text>position: {locationDisplay}</Text>
            <Text>padding: {paddingDisplay}</Text>
          </View>
        </View>
      </SafeAreaView>
    </Page>
  );
};

export default CameraAnimation;
