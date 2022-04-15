import React, {useState} from 'react';
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
  buttonRow: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  info: {
    padding: 10,
  },
};

const randPadding = () => {
  const items = [50, 100, 150, 200];
  return items[Math.floor(Math.random() * items.length)];
};

const CameraAnimation = props => {
  const initialCoordinates = {
    latitude: 40.759211,
    longitude: -73.984638,
  };

  const [animationMode, setAnimationMode] = useState('flyTo');
  const [coordinates, setCoordinates] = useState(initialCoordinates);
  const [padding, setPadding] = useState({
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  });

  const onPress = _animationMode => {
    setAnimationMode(_animationMode);
    setCoordinates({
      latitude: initialCoordinates.latitude + Math.random() * 0.2,
      longitude: initialCoordinates.longitude + Math.random() * 0.2,
    });
    setPadding({
      paddingTop: randPadding(),
      paddingBottom: randPadding(),
      paddingLeft: randPadding(),
      paddingRight: randPadding(),
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
          padding={padding}
        />

        <ShapeSource id="source" shape={shape}>
          <CircleLayer id="layer" style={styles.circle} />
        </ShapeSource>
      </MapView>

      <SafeAreaView>
        <View style={styles.buttonRow}>
          <Button title="Flight" onPress={() => onPress('flyTo')} />
          <Button title="Move" onPress={() => onPress('moveTo')} />
          <Button title="Ease" onPress={() => onPress('easeTo')} />
          <Button title="Linear" onPress={() => onPress('linearTo')} />
        </View>
        <View style={styles.info}>
          <Text>
            {`Coordinates: Lon ${coordinates.longitude.toFixed(
              4,
            )} | Lat ${coordinates.latitude.toFixed(4)}`}
          </Text>
          <Text>
            {`Padding: L ${padding.paddingLeft} | R ${padding.paddingRight} | ${padding.paddingTop} | B ${padding.paddingBottom}`}
          </Text>
        </View>
      </SafeAreaView>
    </Page>
  );
};

export default CameraAnimation;
