import { useMemo, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Atmosphere, Camera, MapView } from '@rnmapbox/maps';

const STYLE_DARK = 'mapbox://styles/mapbox/dark-v11';
const STYLE_STANDARD = 'mapbox://styles/mapbox/standard';

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    padding: 10,
  },
  text: {
    color: 'white',
  },
});

const BugReportExample = () => {
  const [styleURL, setStyleURL] = useState(STYLE_DARK);
  const [showAtmosphere, setShowAtmosphere] = useState(true);

  const atmosphereStyle = useMemo(() => {
    const isDark = styleURL === STYLE_DARK;
    return {
      color: isDark ? 'rgba(29,44,62,1)' : 'rgba(255,255,255,1)',
      highColor: isDark ? 'rgba(11,11,25,1)' : 'rgba(255,255,255,1)',
      spaceColor: isDark ? 'rgba(11,11,25,1)' : 'rgba(255,255,255,1)',
      horizonBlend: 0.03,
      starIntensity: isDark ? 0.6 : 0,
    };
  }, [styleURL]);

  function flipStyle() {
    setStyleURL((prev) => (prev === STYLE_DARK ? STYLE_STANDARD : STYLE_DARK));
  }

  function remountAtmosphere() {
    setShowAtmosphere(false);
    requestAnimationFrame(() => setShowAtmosphere(true));
  }

  return (
    <View style={styles.map}>
      <MapView style={styles.map} styleURL={styleURL} surfaceView={false}>
        <Camera
          centerCoordinate={[8.856142, 45.60942]}
          zoomLevel={13}
          pitch={45}
          heading={0}
        />
        {showAtmosphere ? <Atmosphere style={atmosphereStyle} /> : null}
      </MapView>

      <View style={styles.controls}>
        <Text style={styles.text}>
          Repro: tap quickly to trigger Atmosphere mount/style race
        </Text>
        <Button title="Toggle style (dark - standard)" onPress={flipStyle} />
        <Button title="Remount Atmosphere" onPress={remountAtmosphere} />
      </View>
    </View>
  );
};

export default BugReportExample;
