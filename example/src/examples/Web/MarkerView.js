import React from 'react';
import { View, Text } from 'react-native';
import { MapView, Camera, MarkerView } from '@rnmapbox/maps';

function MarkerViewExample() {
  return (
    <MapView style={{ flex: 1 }}>
      <Camera zoomLevel={9} centerCoordinate={[-73.970895, 40.723279]} />
      <MarkerView coordinate={[-73.970895, 40.723279]}>
        <View style={{ backgroundColor: 'red', padding: 8 }}>
          <Text>Hello</Text>
        </View>
      </MarkerView>
    </MapView>
  );
}

export default MarkerViewExample;

/* end-example-doc */

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'MarkerView',
  tags: ['MarkerView'],
  docs: `
Shows MarkerView
`,
};
MarkerViewExample.metadata = metadata;
