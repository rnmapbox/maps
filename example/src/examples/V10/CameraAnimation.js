import React, {useMemo, useState} from 'react';
import {Button, SafeAreaView, Text, View} from 'react-native';
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
  sheet: {
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  section: {
    paddingVertical: 10,
  },
  buttonRow: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
};

const zeroPadding = {
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
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

const CameraAnimation = props => {
  const initialCoordinates = {
    latitude: 40.759211,
    longitude: -73.984638,
  };

  const [animationMode, setAnimationMode] = useState('moveTo');
  const [coordinates, setCoordinates] = useState(initialCoordinates);
  const [padding, setPadding] = useState(zeroPadding);

  const coordinatesDisplay = useMemo(() => {
    const lon = coordinates.longitude.toFixed(4);
    const lat = coordinates.latitude.toFixed(4);
    return `Lon ${lon} | Lat ${lat}`;
  }, [coordinates]);

  const paddingDisplay = useMemo(() => {
    return `L ${padding.paddingLeft} | R ${padding.paddingRight} | T ${padding.paddingTop} | B ${padding.paddingBottom}`;
  }, [padding]);

  const changePosition = _animationMode => {
    setAnimationMode(_animationMode);
    setCoordinates({
      latitude: initialCoordinates.latitude + Math.random() * 0.2,
      longitude: initialCoordinates.longitude + Math.random() * 0.2,
    });
    setPadding(randPadding());
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
          padding={padding}
          animationDuration={800}
        />

        <ShapeSource id="source" shape={shape}>
          <CircleLayer id="layer" style={styles.circle} />
        </ShapeSource>
      </MapView>

      <SafeAreaView>
        <View style={styles.sheet}>
          <View style={styles.section}>
            <View style={styles.buttonRow}>
              <Button title="Flight" onPress={() => changePosition('flyTo')} />
              <Button title="Ease" onPress={() => changePosition('easeTo')} />
              <Button
                title="Linear"
                onPress={() => changePosition('linearTo')}
              />
              <Button
                title="Instant"
                onPress={() => changePosition('moveTo')}
              />
              <Button
                title="Padding"
                onPress={() => {
                  setAnimationMode('easeTo');
                  setPadding(randPadding());
                }}
              />
            </View>
            <Text>Position ({coordinatesDisplay})</Text>
            <Text>Padding ({paddingDisplay})</Text>
          </View>
        </View>
      </SafeAreaView>
    </Page>
  );
};

export default CameraAnimation;
