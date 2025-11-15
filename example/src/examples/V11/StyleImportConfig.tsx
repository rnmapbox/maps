import { Button } from 'react-native';
import { useState } from 'react';
import { MapView, Camera, StyleImport } from '@rnmapbox/maps';

const StyleImportConfig = () => {
  const [lightPreset, setLightPreset] = useState('night');
  const nextLightPreset = lightPreset === 'night' ? 'day' : 'night';
  return (
    <>
      <Button
        title={`Change to ${nextLightPreset}`}
        onPress={() => {
          setLightPreset(nextLightPreset);
        }}
      />
      <MapView
        style={styles.mapView}
        styleURL={'mapbox://styles/mapbox/standard-beta'}
      >
        <Camera
          defaultSettings={{ centerCoordinate: [-74.00597, 40.71427] }}
          centerCoordinate={[-74.00597, 40.71427]}
          animationDuration={0}
          zoomLevel={18}
          pitch={33}
        />
        <StyleImport
          id="basemap"
          existing
          config={{
            lightPreset: lightPreset,
          }}
        />
      </MapView>
    </>
  );
};

const styles = {
  mapView: { flex: 1 },
};

/* end-example-doc */

const metadata = {
  title: 'Style Import Config',
  tags: ['StyleImport', 'v11'],
  docs: `
# Style Import Config

This example shows how to change style import configs - v11 only.
`,
};

StyleImportConfig.metadata = metadata;

export default StyleImportConfig;
