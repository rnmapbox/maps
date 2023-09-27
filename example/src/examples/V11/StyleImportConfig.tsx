import React, { useState } from 'react';
import { Button, SafeAreaView } from 'react-native';
import { MapView, StyleImport, Camera } from '@rnmapbox/maps';

const styles = {
  mapView: { flex: 1 },
};

const StyleImportConfig = () => {
  const [lightPreset, setLightPreset] = useState('night');
  console.log('# lightPreset', lightPreset);
  const nextLightPreset = lightPreset === 'night' ? 'day' : 'night';
  return (
    <SafeAreaView style={{ flex: 1 }}>
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
          centerCoordinate={[-74.00597, 40.71427]}
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
    </SafeAreaView>
  );
};

StyleImportConfig.title = 'Style Import Config';
StyleImportConfig.tags = ['StyleImport', 'v11'];
StyleImportConfig.docs = `
# Style Import Config

This example shows how to change style import configs - v11 only.
`;

export default StyleImportConfig;
