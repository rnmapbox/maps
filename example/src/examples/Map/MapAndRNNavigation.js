import React, { useState } from 'react';
import { Button, Modal} from 'react-native';
import { MapView, UserLocation, Camera } from '@rnmapbox/maps';

import MapInModal from './MapInModal';

/**
 * @param {ItempProps['navigation']} navigation
 */
export default function MapAndNavigation({ navigation }) {
  const [showMap, setShowMap] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Button title="Modal" onPress={() => setModalVisible(true)} />
      <Button title="Modal (with React Navigation)" onPress={() => navigation.navigate('MapInModal')} />
      <Button
        title="Toggle map"
        onPress={() => setShowMap((wasShowingMap) => !wasShowingMap)}
      />
      <Button
        title="Navigate"
        onPress={() => navigation.navigate('ScreenWithoutMap')}
      />
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
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <MapInModal dismiss={() => setModalVisible(false)}/>
      </Modal>
    </>
  );
}

/* end-example-doc */

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'Map and React Navigation',
  tags: ['MapView'],
  docs: `
Demonstrates various ways to embedd map via (Navigation, Page, modal, etc)
`,
};
MapAndNavigation.metadata = metadata;
