import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

import sheet from '../../styles/sheet';
import Page from '../common/Page';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const style = JSON.stringify(require('../../assets/map-styleURL-style.json'));

const ShowMap = (props: BaseExampleProps) => {
  useEffect(() => {
    MapboxGL.locationManager.start();

    return (): void => {
      MapboxGL.locationManager.stop();
    };
  }, []);

  const onUserMarkerPress = (): void => {
    Alert.alert('You pressed on the user location annotation');
  };

  return (
    <Page {...props}>
      <MapboxGL.MapView styleURL={style} style={sheet.matchParent}>
        <MapboxGL.Camera followZoomLevel={3} followUserLocation />

        <MapboxGL.UserLocation onPress={onUserMarkerPress} />
      </MapboxGL.MapView>
    </Page>
  );
};

export default ShowMap;
