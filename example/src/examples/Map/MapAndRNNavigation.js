import React, { useState } from 'react';
import {
  Button,
  Image,
  Pressable,
  View,
  StyleSheet,
  Modal,
  Text,
} from 'react-native';
import MapboxGL, {
  MapView,
  ShapeSource,
  SymbolLayer,
  CircleLayer,
  UserLocation,
  Camera,
} from '@rnmapbox/maps';

import Page from '../common/Page';

const styles = {
  mapView: { flex: 1 },
  circleLayer: {
    circleRadiusTransition: { duration: 5000, delay: 0 },
    circleColor: '#ff0000',
  },
};

const features = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'a-feature',
      properties: {
        icon: 'example',
        text: 'example-icon-and-label',
      },
      geometry: {
        type: 'Point',
        coordinates: [-74.00597, 40.71427],
      },
    },
    {
      type: 'Feature',
      id: 'b-feature',
      properties: {
        text: 'just-label',
      },
      geometry: {
        type: 'Point',
        coordinates: [-74.001097, 40.71527],
      },
    },
    {
      type: 'Feature',
      id: 'c-feature',
      properties: {
        icon: 'example',
      },
      geometry: {
        type: 'Point',
        coordinates: [-74.00697, 40.72427],
      },
    },
  ],
};

export default function MapAndNavigation({
  navigation,
  label,
  onDismissExample,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [radius, setRadius] = useState(20);

  const circleLayerStyle = {
    ...styles.circleLayer,
    ...{ circleRadius: radius },
  };

  console.log('+++ modalVisible', modalVisible);
  console.log('### rendering...');

  return (
    <Page label={label} onDismissExample={onDismissExample}>
      <Button title="Grow" onPress={() => setRadius((radius) => radius + 20)} />
      <Button title="Modal" onPress={() => setModalVisible(true)} />
      <Button
        title="Toggle map"
        onPress={() => setShowMap((showMap) => !showMap)}
      />
      <Button
        title="Navigate"
        onPress={() => navigation.navigate('ScreenWithoutMap')}
      />
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          this.setState({ modalVisbile: false });
        }}
      >
        <Text>this is a modal</Text>
        <Button
          title="close"
          onPress={() => {
            this.setState({ modalVisbile: false });
          }}
        />
        <MapView style={{ flex: 1 }} />
      </Modal>
      {showMap && (
        <MapView style={{ flex: 1 }}>
          <Camera
            centerCoordinate={[-74.00597, 40.71427]}
            zoomLevel={14}
            followUserLocation
            followZoomLevel={14}
          />
          <UserLocation
            androidRenderMode={'gps'}
            showsUserHeadingIndicator={true}
            renderMode={'native'}
          />
        </MapView>
      )}
    </Page>
  );
}
