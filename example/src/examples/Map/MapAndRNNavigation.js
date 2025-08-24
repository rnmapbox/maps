import React, { useState } from 'react';
import { Button} from 'react-native';
import { MapView, UserLocation, Camera } from '@rnmapbox/maps';

/**
 * @param {ItempProps['navigation']} navigation
 */
export default function MapAndNavigation({ navigation }) {
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      <Button title="Modal" onPress={() => navigation.navigate('MapInModal')} />
      <Button
        title="Toggle map"
        onPress={() => setShowMap((showMap) => !showMap)}
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
