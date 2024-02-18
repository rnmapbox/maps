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

const toPosition = (coordinate: Coordinate): Position => {
  return [coordinate.longitude, coordinate.latitude];
};

const rand = () => Math.random() * 0.008;

const CameraAnimation = () => {
  const [easing, setEasing] = useState<CameraAnimationMode>('easeTo');
  const [coordinates, setCoordinates] = useState<Coordinate[]>([
    initialCoordinate,
  ]);
  const [paddingLeft, setPaddingLeft] = useState(0);
  const [paddingRight, setPaddingRight] = useState(0);
  const [paddingTop, setPaddingTop] = useState(0);
  const [paddingBottom, setPaddingBottom] = useState(0);
  const [zoom, setZoom] = useState(10);
  const [minZoom, setMinZoom] = useState<number | undefined>(undefined);
  const [maxZoom, setMaxZoom] = useState<number | undefined>(undefined);

  const move = useCallback((kind: 'center' | 'bounds') => {
    if (kind === 'bounds') {
      const _centerCoordinate = {
        latitude: initialCoordinate.latitude + rand(),
        longitude: initialCoordinate.longitude + rand(),
      };
      const _coordinates = Array(10)
        .fill(0)
        .map((_) => {
          return {
            latitude: _centerCoordinate.latitude + rand(),
            longitude: _centerCoordinate.longitude + rand(),
          };
        });
      setCoordinates(_coordinates);
    } else if (kind === 'center') {
      setCoordinates([
        {
          latitude: initialCoordinate.latitude + rand(),
          longitude: initialCoordinate.longitude + rand(),
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
      const isChecked = value === easing;
      return (
        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <CheckBox
            checked={isChecked}
            center={true}
            onIconPress={() => setEasing(value)}
            containerStyle={{
              backgroundColor: 'transparent',
              marginRight: -4,
            }}
          />
          <Text
            style={{
              flex: 0,
              color: isChecked ? colors.primary.blue : undefined,
            }}
          >
            {label}
          </Text>
        </View>
      );
    },
    [easing],
  );

  const zoomCounter = useMemo(() => {
    const disabled = coordinates.length > 1;

    return (
      <View style={{ flex: 1, paddingHorizontal: 10 }}>
        <View style={{ flex: 0, alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', opacity: disabled ? 0.4 : 1 }}>
            {zoom}
          </Text>
        </View>
        <Slider
          thumbStyle={[
            styles.thumb,
            { backgroundColor: disabled ? 'lightgray' : 'black' },
          ]}
          trackStyle={{ opacity: disabled ? 0.1 : 1 }}
          value={zoom}
          disabled={disabled}
          minimumValue={1}
          maximumValue={20}
          onSlidingComplete={(_value) => {
            setZoom(Math.round(_value));
          }}
        />
      </View>
    );
  }, [coordinates.length, zoom]);

  const paddingCounter = useCallback(
    (value: number, setValue: (value: number) => void, label: string) => {
      return (
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <View style={{ flex: 0, alignItems: 'center' }}>
            <Text>{label}</Text>
            <Text style={{ fontWeight: 'bold' }}>{`${Math.round(value)}`}</Text>
          </View>
          <Slider
            thumbStyle={styles.thumb}
            value={value}
            minimumValue={0}
            maximumValue={500}
            onSlidingComplete={(_value) => setValue(_value)}
          />
        </View>
      );
    },
    [],
  );

  const zoomLimitCounter = useCallback(
    (
      value: number | undefined,
      setValue: (value?: number) => void,
      label: string,
    ) => {
      return (
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <View style={{ flex: 0, alignItems: 'center' }}>
            <Text>{label}</Text>
            <Text style={{ fontWeight: 'bold' }}>
              {`${value ?? 'Not set'}`}
            </Text>
          </View>
          <Slider
            thumbStyle={styles.thumb}
            value={value}
            minimumValue={-1}
            maximumValue={20}
            onSlidingComplete={(_value) => {
              if (_value < 0) {
                setValue(undefined);
              } else {
                setValue(Math.round(_value));
              }
            }}
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
          zoomLevel={zoom}
          minZoomLevel={minZoom}
          maxZoomLevel={maxZoom}
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
            <Text style={styles.sectionText}>Coordinate</Text>
            <View style={styles.buttonRow}>
              <Button title="Center" onPress={() => move('center')} />
              <Button title="Bounds" onPress={() => move('bounds')} />
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionText}>Easing</Text>
            <View style={[styles.buttonRow, { marginBottom: -6 }]}>
              {easingCheckBox('easeTo', 'Ease')}
              {easingCheckBox('linearTo', 'Linear')}
              {easingCheckBox('flyTo', 'Fly')}
              {easingCheckBox('moveTo', 'Move')}
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionText}>Zoom</Text>
            <View style={[styles.buttonRow, { marginBottom: -6 }]}>
              {zoomCounter}
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionText}>Padding</Text>
            <View style={[styles.buttonRow, { marginTop: 6 }]}>
              {paddingCounter(paddingTop, setPaddingTop, 'Top')}
              {paddingCounter(paddingBottom, setPaddingBottom, 'Bottom')}
              {paddingCounter(paddingLeft, setPaddingLeft, 'Left')}
              {paddingCounter(paddingRight, setPaddingRight, 'Right')}
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionText}>Zoom limits</Text>
            <View style={[styles.buttonRow, { marginTop: 6 }]}>
              {zoomLimitCounter(minZoom, setMinZoom, 'Min')}
              {zoomLimitCounter(maxZoom, setMaxZoom, 'Max')}
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
    paddingHorizontal: 10,
    marginBottom: -10,
  },
  content: {
    padding: 10,
  },
  sectionText: {
    fontSize: 10,
    color: 'gray',
  },
  buttonRow: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  divider: {
    marginVertical: 8,
  },
  thumb: {
    backgroundColor: 'black',
    width: 15,
    height: 15,
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
