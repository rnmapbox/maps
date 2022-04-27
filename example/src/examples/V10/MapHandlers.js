import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import {
  MapView,
  Camera,
  CircleLayer,
  ShapeSource,
  Logger,
} from '@rnmapbox/maps';
import { Text, Divider } from 'react-native-elements';

import Page from '../common/Page';
import colors from '../../styles/colors';

Logger.setLogLevel('verbose');

const styles = {
  map: {
    flex: 1,
  },
  info: {
    flex: 0,
    padding: 10,
  },
  divider: {
    marginVertical: 10,
  },
  fadedText: {
    color: 'gray',
  },
};

const MapHandlers = (props) => {
  const [lastCallback, setLastCallback] = useState('');
  const [mapState, setMapState] = useState({});
  const [features, setFeatures] = useState([]);

  const properties = mapState?.properties;
  const center = properties?.center;
  const bounds = properties?.bounds;
  const gestures = mapState?.gestures;

  const buildShape = (feature) => {
    return {
      type: 'Point',
      coordinates: feature.geometry.coordinates,
    };
  };

  const addFeature = (feature, kind) => {
    const _feature = { ...feature };
    _feature.properties.kind = kind;
    setFeatures((prev) => [...prev, _feature]);
  };

  const display = (position) => {
    if (!position) {
      return '';
    }
    return `${position[1].toFixed(3)}, ${position[0].toFixed(3)}`;
  };

  return (
    <Page {...props}>
      <MapView
        style={styles.map}
        onPress={(_feature) => {
          addFeature(_feature, 'press');
        }}
        onLongPress={(_feature) => {
          addFeature(_feature, 'longPress');
        }}
        onCameraChanged={(_state) => {
          setLastCallback('onCameraChanged');
          setMapState(_state);
        }}
        onMapIdle={(_state) => {
          setLastCallback('onMapIdle');
          setMapState(_state);
        }}
      >
        <Camera
          centerCoordinate={[-73.984638, 40.759211]}
          zoomLevel={12}
          animationDuration={0}
        />
        {features.map((f, i) => {
          const id = JSON.stringify(f.geometry.coordinates);
          const circleStyle =
            f.properties.kind === 'press'
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
            Tap or long-press to create a marker.
          </Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>center</Text>
          <Text>{display(center)}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>bounds</Text>
          <Text>NE: {display(bounds?.ne)}</Text>
          <Text>NE: {display(bounds?.sw)}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>lastCallback</Text>
          <Text>{lastCallback}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>isGestureActive</Text>
          <Text>{gestures?.isGestureActive ? 'Yes' : 'No'}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>isAnimatingFromGesture</Text>
          <Text>{gestures?.isAnimatingFromGesture ? 'Yes' : 'No'}</Text>
        </View>
      </SafeAreaView>
    </Page>
  );
};

export default MapHandlers;
