import React, { useMemo, useState } from 'react';
import { Button, SafeAreaView, View } from 'react-native';
import {
  MapView,
  Camera,
  ShapeSource,
  CircleLayer,
  Logger,
} from '@rnmapbox/maps';
import bbox from '@turf/bbox';
import { Text, Divider } from 'react-native-elements';

import Page from '../common/Page';
import colors from '../../styles/colors';

Logger.setLogLevel('verbose');

const styles = {
  map: {
    flex: 1,
  },
  circle: {
    circleRadius: 6,
    circleColor: colors.primary.blue,
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

const toPosition = (coordinate) => {
  return [coordinate.longitude, coordinate.latitude];
};

const CameraAnimation = (props) => {
  const initialCoordinate = {
    latitude: 40.759211,
    longitude: -73.984638,
  };

  const [animationMode, setAnimationMode] = useState('moveTo');
  const [coordinates, setCoordinates] = useState([initialCoordinate]);
  const [padding, setPadding] = useState(zeroPadding);

  const paddingDisplay = useMemo(() => {
    return `L ${padding.paddingLeft} | R ${padding.paddingRight} | T ${padding.paddingTop} | B ${padding.paddingBottom}`;
  }, [padding]);

  const move = (_animationMode, shouldCreateMultiple) => {
    setAnimationMode(_animationMode);

    if (shouldCreateMultiple) {
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
    } else {
      setCoordinates([
        {
          latitude: initialCoordinate.latitude + Math.random() * 0.2,
          longitude: initialCoordinate.longitude + Math.random() * 0.2,
        },
      ]);
    }
  };

  const features = useMemo(() => {
    return coordinates.map((p) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: toPosition(p),
        },
      };
    });
  }, [coordinates]);

  const centerOrBounds = useMemo(() => {
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

  const locationDisplay = useMemo(() => {
    if (coordinates.length > 1) {
      const ne = centerOrBounds.bounds?.ne.map((n) => n.toFixed(3));
      const sw = centerOrBounds.bounds?.sw.map((n) => n.toFixed(3));
      return `ne ${ne} | sw ${sw}`;
    } else if (coordinates.length === 1) {
      const lon = coordinates[0].longitude.toFixed(4);
      const lat = coordinates[0].latitude.toFixed(4);
      return `lon ${lon} | lat ${lat}`;
    }
  }, [coordinates, centerOrBounds]);

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
              <CircleLayer id={`layer-${id}`} style={styles.circle} />
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
