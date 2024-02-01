import { CheckBox, Divider, Slider, Text } from '@rneui/base';
import {
  Camera,
  CameraAnimationMode,
  CameraBounds,
  CircleLayer,
  Logger,
  MapView,
  ShapeSource,
} from '@rnmapbox/maps';
import bbox from '@turf/bbox';
import { Feature, Point, Position } from 'geojson';
import React, { useCallback, useMemo, useState } from 'react';
import { Button, SafeAreaView, StyleSheet, View } from 'react-native';

import colors from '../../styles/colors';
import { ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

Logger.setLogLevel('verbose');

type Coordinate = {
  longitude: number;
  latitude: number;
};

const mapStyles = {
  circle: {
    circleRadius: 6,
    circleColor: colors.primary.blue,
  },
};

const initialCoordinate: Coordinate = {
  latitude: 40.759211,
  longitude: -73.984638,
};

const minZoomLevel = 8;
const maxZoomLevel = 16;

const toPosition = (coordinate: Coordinate): Position => {
  return [coordinate.longitude, coordinate.latitude];
};

const CameraAnimation = () => {
  const [easing, setEasing] = useState<CameraAnimationMode>('easeTo');
  const [coordinates, setCoordinates] = useState<Coordinate[]>([
    initialCoordinate,
  ]);
  const [paddingLeft, setPaddingLeft] = useState(0);
  const [paddingRight, setPaddingRight] = useState(0);
  const [paddingTop, setPaddingTop] = useState(0);
  const [paddingBottom, setPaddingBottom] = useState(0);

  const move = useCallback((kind: 'center' | 'bounds') => {
    if (kind === 'bounds') {
      const _centerCoordinate = {
        latitude: initialCoordinate.latitude + Math.random() * 0.2,
        longitude: initialCoordinate.longitude + Math.random() * 0.2,
      };
      const _coordinates = Array(10)
        .fill(0)
        .map((_) => {
          return {
            latitude: _centerCoordinate.latitude + Math.random() * 0.2,
            longitude: _centerCoordinate.longitude + Math.random() * 0.2,
          };
        });
      setCoordinates(_coordinates);
    } else if (kind === 'center') {
      setCoordinates([
        {
          latitude: initialCoordinate.latitude + Math.random() * 0.2,
          longitude: initialCoordinate.longitude + Math.random() * 0.2,
        },
      ]);
    }
  }, []);

  const features = useMemo((): Feature<Point>[] => {
    return coordinates.map((p) => {
      const feature: Feature<Point> = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: toPosition(p),
        },
        properties: {},
      };
      return feature;
    });
  }, [coordinates]);

  const centerOrBounds = useMemo((): {
    centerCoordinate?: Position;
    bounds?: CameraBounds;
  } => {
    if (coordinates.length === 1) {
      return {
        centerCoordinate: toPosition(coordinates[0]),
      };
    } else {
      const positions = coordinates.map(toPosition);
      const lineString = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: positions,
        },
      };
      const _bbox = bbox(lineString);
      return {
        bounds: {
          ne: [_bbox[0], _bbox[1]],
          sw: [_bbox[2], _bbox[3]],
        },
      };
    }
  }, [coordinates]);

  const easingCheckBox = useCallback(
    (value: CameraAnimationMode, label: string) => {
      return (
        <View style={{ flex: 1, paddingHorizontal: 5 }}>
          <Text style={{ textAlign: 'center' }}>{label}</Text>
          <CheckBox
            checked={value === easing}
            center={true}
            onIconPress={() => setEasing(value)}
            containerStyle={{ backgroundColor: 'transparent' }}
          />
        </View>
      );
    },
    [easing],
  );

  const paddingCounter = useCallback(
    (value: number, setValue: (value: number) => void, label: string) => {
      return (
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <View style={{ flex: 0, alignItems: 'center' }}>
            <Text>{label}</Text>
            <Text style={{ fontWeight: 'bold' }}>{`${Math.round(value)}`}</Text>
          </View>
          <Slider
            thumbStyle={{
              backgroundColor: 'black',
              width: 15,
              height: 15,
            }}
            value={value}
            minimumValue={0}
            maximumValue={400}
            onSlidingComplete={(_value) => setValue(_value)}
          />
        </View>
      );
    },
    [],
  );

  return (
    <>
      <MapView style={styles.map}>
        <Camera
          {...centerOrBounds}
          zoomLevel={12}
          minZoomLevel={minZoomLevel}
          maxZoomLevel={maxZoomLevel}
          padding={{
            paddingTop,
            paddingBottom,
            paddingLeft,
            paddingRight,
          }}
          animationDuration={800}
          animationMode={easing}
        />

        {features.map((feature) => {
          const id = JSON.stringify(feature.geometry);
          return (
            <ShapeSource key={id} id={`source-${id}`} shape={feature}>
              <CircleLayer id={`layer-${id}`} style={mapStyles.circle} />
            </ShapeSource>
          );
        })}
      </MapView>

      <SafeAreaView>
        <View style={styles.sheet}>
          <View style={styles.content}>
            <Text style={styles.fadedText}>Coordinate</Text>
            <View style={styles.buttonRow}>
              <Button title="Center" onPress={() => move('center')} />
              <Button title="Bounds" onPress={() => move('bounds')} />
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.fadedText}>Easing</Text>
            <View style={[styles.buttonRow, { marginTop: 10 }]}>
              {easingCheckBox('easeTo', 'Ease')}
              {easingCheckBox('linearTo', 'Linear')}
              {easingCheckBox('flyTo', 'Fly')}
              {easingCheckBox('moveTo', 'Move')}
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.fadedText}>Padding</Text>
            <View style={[styles.buttonRow, { marginTop: 10 }]}>
              {paddingCounter(paddingTop, setPaddingTop, 'Top')}
              {paddingCounter(paddingBottom, setPaddingBottom, 'Bottom')}
              {paddingCounter(paddingLeft, setPaddingLeft, 'Left')}
              {paddingCounter(paddingRight, setPaddingRight, 'Right')}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

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
    justifyContent: 'space-evenly',
  },
  divider: {
    marginVertical: 10,
  },
  fadedText: {
    color: 'gray',
  },
});

export default CameraAnimation;

/* end-example-doc */

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Camera Animation',
  tags: ['Camera', 'Camera#animationMode'],
  docs: `
Camera animation modes
`,
};
CameraAnimation.metadata = metadata;
