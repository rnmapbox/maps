import { useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { Camera, MapView, Snow, Rain } from '@rnmapbox/maps';

type WeatherEffect = 'none' | 'snow' | 'rain';

const SnowAndRain = () => {
  const [effect, setEffect] = useState<WeatherEffect>('snow');

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <Button title="Snow" onPress={() => setEffect('snow')} />
        <Button title="Rain" onPress={() => setEffect('rain')} />
        <Button title="None" onPress={() => setEffect('none')} />
      </View>
      <MapView style={styles.map}>
        <Camera
          zoomLevel={12}
          centerCoordinate={[-122.4194, 37.7749]}
          pitch={45}
        />
        {effect === 'snow' && (
          <Snow
            style={{
              density: 0.85,
              intensity: 0.8,
              color: '#ffffff',
              opacity: 1.0,
            }}
          />
        )}
        {effect === 'rain' && (
          <Rain
            style={{
              density: 0.5,
              intensity: 0.8,
              opacity: 0.88,
              // Explicit colors avoid the default measure-light(brightness) expressions
              // which fail in some style contexts
              color: '#a8adbc',
              vignetteColor: '#464646',
            }}
          />
        )}
      </MapView>
    </View>
  );
};

export default SnowAndRain;

/* end-example-doc */

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'Snow & Rain',
  tags: ['Snow', 'Rain', 'particle', 'weather', 'experimental'],
  docs: `
Demonstrates the experimental Snow and Rain particle effects available in Mapbox Maps SDK v11.9+.

Use the buttons to toggle between snow, rain, or no effect.
`,
};
SnowAndRain.metadata = metadata;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
  },
});
