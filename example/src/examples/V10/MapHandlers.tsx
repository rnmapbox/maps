import { Button, Divider, Text } from '@rneui/base';
import {
  Camera,
  CircleLayer,
  Logger,
  type MapState,
  MapView,
  ShapeSource,
} from '@rnmapbox/maps';
import type {
  Feature,
  GeoJsonProperties,
  Geometry,
  Point,
  Polygon,
  Position,
} from 'geojson';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../../styles/colors';
import type { ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

Logger.setLogLevel('verbose');

const styles = {
  map: {
    flex: 1,
  },
  info: {
    flex: 0,
    padding: 10,
  },
  controls: {
    gap: 8,
  },
  divider: {
    marginVertical: 6,
  },
  fadedText: {
    color: 'gray',
  },
};

const CAMERA_CHANGED_THROTTLE_MS = 250;

const MapHandlers = () => {
  const [lastCallback, setLastCallback] = useState('');
  const [cameraChangedThrottleInterval, setCameraChangedThrottleInterval] =
    useState(0);
  const [cameraChangedCount, setCameraChangedCount] = useState(0);
  const [mapIdleCount, setMapIdleCount] = useState(0);
  const [mapState, setMapState] = useState<MapState>({
    properties: {
      center: [0, 0],
      bounds: {
        ne: [0, 0],
        sw: [0, 0],
      },
      zoom: 0,
      heading: 0,
      pitch: 0,
    },
    gestures: {
      isGestureActive: false,
    },
  });
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);

  const properties = mapState?.properties;
  const center = properties?.center;
  const bounds = properties?.bounds;
  const heading = properties?.heading;
  const gestures = mapState?.gestures;

  const toggleCameraChangedThrottle = () => {
    setCameraChangedThrottleInterval((current) =>
      current > 0 ? 0 : CAMERA_CHANGED_THROTTLE_MS,
    );
    setCameraChangedCount(0);
    setMapIdleCount(0);
    setLastCallback('');
  };

  const buildShape = (feature: Feature<Geometry>): Geometry => {
    return {
      type: 'Point',
      coordinates: (feature as Feature<Point>).geometry.coordinates,
    };
  };

  const addFeature = (feature: Feature<Geometry>, kind: string) => {
    const _feature: Feature<Geometry> = { ...feature };
    if (_feature.properties) {
      _feature.properties.kind = kind;
    }
    setFeatures((prev) => [...prev, _feature]);
  };

  const displayCoord = (position: Position) => {
    if (!position) {
      return '';
    }
    return `${position[1]!.toFixed(3)}, ${position[0]!.toFixed(3)}`;
  };

  return (
    <>
      <MapView
        style={styles.map}
        cameraChangedThrottleInterval={cameraChangedThrottleInterval}
        onPress={(_feature: Feature<Geometry, GeoJsonProperties>) => {
          addFeature(_feature, 'press');
        }}
        onLongPress={(_feature: Feature<Geometry, GeoJsonProperties>) => {
          addFeature(_feature, 'longPress');
        }}
        onCameraChanged={(_state) => {
          setLastCallback('onCameraChanged');
          setCameraChangedCount((count) => count + 1);
          setMapState(_state);
        }}
        onMapIdle={(_state) => {
          setLastCallback('onMapIdle');
          setMapIdleCount((count) => count + 1);
          setMapState(_state);
        }}
      >
        <Camera
          centerCoordinate={[-73.984638, 40.759211]}
          zoomLevel={12}
          animationDuration={0}
        />
        {features.map((f, _i) => {
          const id = JSON.stringify(
            (f as Feature<Polygon>).geometry.coordinates,
          );
          const circleStyle =
            f.properties?.kind === 'press'
              ? {
                  circleColor: colors.primary.blue,
                  circleRadius: 6,
                }
              : {
                  circleColor: colors.primary.pink,
                  circleRadius: 12,
                };
          return (
            <ShapeSource key={id} id={`source-${id}`} shape={buildShape(f)}>
              <CircleLayer id={`layer-${id}`} style={circleStyle} />
            </ShapeSource>
          );
        })}
      </MapView>

      <SafeAreaView>
        <View style={styles.info}>
          <Text style={styles.fadedText}>
            Tap or long-press to create a marker. Pan or pinch-zoom the map to
            compare event volume with and without throttling.
          </Text>

          <Divider style={styles.divider} />

          <View style={styles.controls}>
            <Button
              title={
                cameraChangedThrottleInterval > 0
                  ? 'Disable onCameraChanged throttle'
                  : 'Enable onCameraChanged throttle'
              }
              type="outline"
              onPress={toggleCameraChangedThrottle}
            />

            <Text style={styles.fadedText}>cameraChangedThrottleInterval</Text>
            <Text>{cameraChangedThrottleInterval} ms</Text>
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>center</Text>
          <Text>{displayCoord(center)}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>bounds</Text>
          <Text>NE: {displayCoord(bounds?.ne)}</Text>
          <Text>SW: {displayCoord(bounds?.sw)}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>heading</Text>
          <Text>{heading?.toFixed(2)}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>lastCallback</Text>
          <Text>{lastCallback}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>onCameraChanged count</Text>
          <Text>{cameraChangedCount}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>onMapIdle count</Text>
          <Text>{mapIdleCount}</Text>

          <Divider style={styles.divider} />

          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View>
              <Text style={styles.fadedText}>isGestureActive</Text>
              <Text>{gestures?.isGestureActive ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default MapHandlers;

/* end-example-doc */

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Map Handlers',
  tags: [
    'MapView#onCameraChanged',
    'MapView#onMapIdle',
    'MapView#cameraChangedThrottleInterval',
  ],
  docs: `
Map Handlers and cameraChangedThrottleInterval
`,
};
MapHandlers.metadata = metadata;
