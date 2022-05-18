import React, { useMemo, useRef, useState } from 'react';
import { Button, SafeAreaView, StyleSheet, View } from 'react-native';
import MapboxGL, {
  CameraProps,
  CameraAnimationMode,
  CameraRef,
} from '@rnmapbox/maps';
import bbox from '@turf/bbox';
import { Feature, LineString, Point, Position } from '@turf/helpers';
import { Text, Divider } from 'react-native-elements';

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

const initialPosition = [-73.984638, 40.759211];
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

const randPosition = (around: Position): Position => {
  return [around[0] + Math.random() * 0.2, around[1] + Math.random() * 0.2];
};

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
  const [inputKind, setInputKind] = useState<'declarative' | 'imperative'>(
    'declarative',
  );
  const camera = useRef<CameraRef>(null);

  const [animationMode, setAnimationMode] = useState<CameraAnimationMode>('moveTo');
  const [positions, setPositions] = useState([initialPosition]);
  const [padding, setPadding] = useState(zeroPadding);

  const paddingDisplay = useMemo(() => {
    return `L ${padding.paddingLeft} | R ${padding.paddingRight} | T ${padding.paddingTop} | B ${padding.paddingBottom}`;
  }, [padding]);

  const move = (
    _animationMode: CameraAnimationMode,
    shouldCreateMultiple: boolean,
  ) => {
    setAnimationMode(_animationMode);

    if (shouldCreateMultiple) {
      const _centerPosition = randPosition(initialPosition);
      const _positions = Array(10)
        .fill(0)
        .map((_) => randPosition(_centerPosition));
      setPositions(_positions);
    } else {
      setPositions([randPosition(initialPosition)]);
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
        bounds: undefined,
      };
    } else {
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
        centerCoordinate: undefined,
        bounds: {
          ne: [_bbox[0], _bbox[1]],
          sw: [_bbox[2], _bbox[3]],
        },
      };
    }
  }, [positions]);

  const locationDisplay = useMemo(() => {
    if (positions.length > 1) {
      const ne = centerOrBounds.bounds?.ne.map((n: number) => n.toFixed(3));
      const sw = centerOrBounds.bounds?.sw.map((n: number) => n.toFixed(3));
      return `ne ${ne} | sw ${sw}`;
    } else if (positions.length === 1) {
      const [first] = positions;
      const lon = first[0].toFixed(4);
      const lat = first[1].toFixed(4);
      return `lon ${lon} | lat ${lat}`;
    }
  }, [positions, centerOrBounds]);

  const declarativeContent = () => {
    return (
      <View>
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
    );
  };

  const imperativeContent = () => {
    const setCam = camera.current?.setCamera;
    const zoomTo = camera.current?.zoomTo;

    return (
      <View>
        <Text style={styles.fadedText}>setCamera</Text>
        <Button
          title="setCamera(centerCoordinate: <random>)"
          onPress={() =>
            setCam?.({
              centerCoordinate: randPosition(initialPosition),
            })
          }
        />
        <Button
          title="setCamera(centerCoordinate: <random>, duration: 1500)"
          onPress={() =>
            setCam?.({
              centerCoordinate: randPosition(initialPosition),
              animationDuration: 1500,
            })
          }
        />
        <Button
          title="setCamera(centerCoordinate: <random>, animationMode: 'easeTo')"
          onPress={() =>
            setCam?.({
              centerCoordinate: randPosition(initialPosition),
              animationMode: 'easeTo',
            })
          }
        />

        <Text style={styles.fadedText}>zoomTo</Text>
        <Button
          title="zoomTo(<random>)"
          onPress={() => {
            zoomTo?.(Math.random() * maxZoomLevel);
          }}
        />
      </View>
    );
  };

  const content = () => {
    return inputKind === 'declarative'
      ? declarativeContent()
      : imperativeContent();
  };

  return (
    <Page {...props}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          ref={camera}
          {...centerOrBounds}
          zoomLevel={12}
          minZoomLevel={minZoomLevel}
          maxZoomLevel={maxZoomLevel}
          padding={padding}
          animationDuration={1000}
          animationMode={animationMode}
        />
        {inputKind === 'declarative' &&
          features.map((f) => {
            const id = JSON.stringify(f.geometry.coordinates);
            return (
              <MapboxGL.ShapeSource key={id} id={`source-${id}`} shape={f}>
                <MapboxGL.CircleLayer
                  id={`layer-${id}`}
                  style={mapStyles.circle}
                />
              </MapboxGL.ShapeSource>
            );
          })}
      </MapboxGL.MapView>

      <SafeAreaView>
        <View style={styles.sheet}>
          <View style={styles.buttonRow}>
            <Button
              title="declarative"
              color={
                inputKind === 'declarative'
                  ? colors.primary.pink
                  : colors.primary.gray
              }
              onPress={() => setInputKind('declarative')}
            />
            <Button
              title="imperative"
              color={
                inputKind === 'imperative'
                  ? colors.primary.pink
                  : colors.primary.gray
              }
              onPress={() => setInputKind('imperative')}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.content}>{content()}</View>
        </View>
      </SafeAreaView>
    </Page>
  );
};

export default CameraAnimation;
