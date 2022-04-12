import React, {useState} from 'react';
import {Button, SafeAreaView, StyleSheet} from 'react-native';
import {
  MapView,
  Camera,
  ShapeSource,
  CircleLayer,
  Logger,
} from '@rnmapbox/maps';

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
  buttonRow: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
};

const CameraAnimation = props => {
  const initialCoordinates = {
    latitude: 40.759211,
    longitude: -73.984638,
  };

  const [animationMode, setAnimationMode] = useState('flyTo');
  const [coordinates, setCoordinates] = useState(initialCoordinates);

  const onPress = _animationMode => {
    setAnimationMode(_animationMode);

    const offset = Math.random() * 0.2;
    setCoordinates({
      latitude: initialCoordinates.latitude + offset,
      longitude: initialCoordinates.longitude + offset,
    });
  };

  const position = [coordinates.longitude, coordinates.latitude];

  const shape = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: position,
    },
  };

  return (
    <Page {...props}>
      <MapView style={styles.map}>
        <Camera
          centerCoordinate={position}
          animationMode={animationMode}
          zoomLevel={12}
        />

        <ShapeSource id="source" shape={shape}>
          <CircleLayer id="layer" style={styles.circle} />
        </ShapeSource>
      </MapView>

      <SafeAreaView style={styles.buttonRow}>
        <Button title="Flight" onPress={() => onPress('flyTo')} />
        <Button title="Move" onPress={() => onPress('moveTo')} />
        <Button title="Ease" onPress={() => onPress('easeTo')} />
        <Button title="Linear" onPress={() => onPress('linearTo')} />
      </SafeAreaView>
    </Page>
  );
};

export default CameraAnimation;
