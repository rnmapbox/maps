import React, { useState } from 'react';
import { Text } from 'react-native';
import MapboxGL, { Location } from '@rnmapbox/maps';

import sheet from '../../styles/sheet';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';
import Page from '../common/Page';
import Bubble from '../common/Bubble';

const UserLocationUpdates = (props: BaseExampleProps) => {
  const [location, setLocation] = useState<Location>();

  return (
    <Page {...props}>
      <MapboxGL.MapView style={sheet.matchParent}>
        <MapboxGL.UserLocation
          onUpdate={(newLocation) => setLocation(newLocation)}
        />
        <MapboxGL.Camera followUserLocation followZoomLevel={16} />
      </MapboxGL.MapView>

      <Bubble>
        {location && (
          <>
            <Text>Timestamp: {location.timestamp}</Text>
            <Text>Longitude: {location.coords.longitude}</Text>
            <Text>Latitude: {location.coords.latitude}</Text>
            <Text>Altitude: {location.coords.altitude}</Text>
            <Text>Heading: {location.coords.heading}</Text>
            <Text>Accuracy: {location.coords.accuracy}</Text>
            <Text>Speed: {location.coords.speed}</Text>
          </>
        )}
      </Bubble>
    </Page>
  );
};

export default UserLocationUpdates;
