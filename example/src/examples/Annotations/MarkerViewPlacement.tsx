import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

import Bubble from '../common/Bubble';

const CENTER: [number, number] = [-73.9857, 40.7462];
const OVERLAP_SPOT: [number, number] = [-73.9864, 40.7457];
const MIN_ZOOM_SPOT: [number, number] = [-73.985, 40.7457];
const ROOFTOP_SPOT: [number, number] = [-73.9857, 40.7466];
const MIN_ZOOM = 16;

const styles = StyleSheet.create({
  matchParent: { flex: 1 },
  label: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  labelText: { fontWeight: 'bold', color: 'white' },
});

const Label = ({ text, color }: { text: string; color: string }) => (
  <View style={[styles.label, { backgroundColor: color }]} collapsable={false}>
    <Text style={styles.labelText}>{text}</Text>
  </View>
);

const MarkerViewPlacement = () => {
  const [redOnTop, setRedOnTop] = React.useState(true);
  const [allowZElevate, setAllowZElevate] = React.useState(true);
  const [zoomedIn, setZoomedIn] = React.useState(true);
  const [zoom, setZoom] = React.useState(17);

  return (
    <>
      <Button
        title={`Higher priority: ${redOnTop ? 'red' : 'blue'}`}
        onPress={() => setRedOnTop((prev) => !prev)}
      />
      <Button
        title={`allowZElevate: ${allowZElevate}`}
        onPress={() => setAllowZElevate((prev) => !prev)}
      />
      <Button
        title={`Zoom to ${zoomedIn ? 15.5 : 17}`}
        onPress={() => setZoomedIn((prev) => !prev)}
      />
      <Mapbox.MapView
        style={styles.matchParent}
        styleURL={Mapbox.StyleURL.Street}
        onCameraChanged={(state) => setZoom(state.properties.zoom)}
      >
        <Mapbox.Camera
          centerCoordinate={CENTER}
          zoomLevel={zoomedIn ? 17 : 15.5}
          pitch={45}
          animationDuration={0}
        />

        <Mapbox.FillExtrusionLayer
          id="building3d"
          sourceID="composite"
          sourceLayerID="building"
          minZoomLevel={15}
          maxZoomLevel={22}
          style={{
            fillExtrusionColor: '#aaa',
            fillExtrusionHeight: ['get', 'height'],
            fillExtrusionBase: ['get', 'min_height'],
            fillExtrusionOpacity: 0.8,
          }}
        />

        <Mapbox.MarkerView
          coordinate={OVERLAP_SPOT}
          priority={redOnTop ? 1 : 0}
        >
          <Label text="Red marker" color="#d33" />
        </Mapbox.MarkerView>
        <Mapbox.MarkerView
          coordinate={OVERLAP_SPOT}
          priority={redOnTop ? 0 : 1}
        >
          <Label text="Blue marker" color="#36c" />
        </Mapbox.MarkerView>

        <Mapbox.MarkerView coordinate={MIN_ZOOM_SPOT} minZoom={MIN_ZOOM}>
          <Label text={`minZoom ${MIN_ZOOM}`} color="#393" />
        </Mapbox.MarkerView>

        <Mapbox.MarkerView
          coordinate={ROOFTOP_SPOT}
          anchor={{ x: 0.5, y: 1 }}
          allowOverlap
          allowZElevate={allowZElevate}
        >
          <Label text="Rooftop" color="#a3a" />
        </Mapbox.MarkerView>
      </Mapbox.MapView>
      <Bubble>
        <Text>Zoom: {zoom.toFixed(2)}</Text>
        <Text>
          The green marker is hidden below zoom {MIN_ZOOM}. With allowZElevate
          the purple marker sits on the roof instead of the street.
        </Text>
      </Bubble>
    </>
  );
};

export default MarkerViewPlacement;

/* end-example-doc */

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'Marker View Placement',
  tags: [
    'MarkerView',
    'MarkerView#priority',
    'MarkerView#minZoom',
    'MarkerView#allowZElevate',
  ],
  docs: `
Two overlapping markers where \`priority\` picks the one that is shown, a marker hidden
below \`minZoom\`, and a marker on a 3D building that \`allowZElevate\` lifts to the roof.
`,
  webSupported: true,
};
MarkerViewPlacement.metadata = metadata;
