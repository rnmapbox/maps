import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

// Local style without glyphs, sprites or remote sources, so nothing that is
// fetched from Mapbox servers (and can change over time) ends up in a screenshot.
const STYLE_JSON = JSON.stringify({
  version: 8,
  name: 'e2e-screenshots',
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#f4f1ea' },
    },
  ],
});

const styles = StyleSheet.create({
  map: { height: 400 },
});

type Props = {
  children?: ReactNode;
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  styleURL?: string;
};

/**
 * Renders `children` on a deterministic map for the visual snapshots taken by
 * example/e2e/visual.e2e.js; `screenshot-map-idle` appears once the map is idle.
 */
const ScreenshotMap = ({
  children,
  centerCoordinate = [0, 0],
  zoomLevel = 3,
  styleURL = STYLE_JSON,
}: Props) => {
  const [idle, setIdle] = useState(false);

  return (
    <View>
      <Mapbox.MapView
        style={styles.map}
        testID="screenshot-map"
        styleURL={styleURL}
        projection="mercator"
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
        compassEnabled={false}
        onMapIdle={() => setIdle(true)}
      >
        <Mapbox.Camera
          defaultSettings={{ centerCoordinate, zoomLevel }}
          animationDuration={0}
        />
        {children}
      </Mapbox.MapView>
      {idle && <Text testID="screenshot-map-idle">Map idle</Text>}
    </View>
  );
};

export default ScreenshotMap;
