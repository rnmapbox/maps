import React, { FC, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import MapboxGL, { StyleURL, StyleURLKey } from '@rnmapbox/maps';

import sheet from '../../styles/sheet';
import { onSortOptions } from '../../utils';
import TabBarPage from '../common/TabBarPage';

const ShowMap: FC<any> = (props) => {
  const keys = Object.keys(StyleURL) as StyleURLKey[];
  const _mapOptions = keys
    .map((key: StyleURLKey) => {
      return {
        label: key,
        data: StyleURL[key],
      };
    })
    .sort(onSortOptions);

  const [styleURL, setStyleURL] = useState<typeof StyleURL[StyleURLKey]>(
    _mapOptions[0].data,
  );

  useEffect(() => {
    MapboxGL.locationManager.start();

    return (): void => {
      MapboxGL.locationManager.stop();
    };
  }, []);

  const onMapChange = (
    index: number,
    newStyleURL: typeof StyleURL[StyleURLKey],
  ): void => {
    setStyleURL(newStyleURL);
  };

  const onUserMarkerPress = (): void => {
    Alert.alert('You pressed on the user location annotation');
  };

  return (
    <TabBarPage
      {...props}
      scrollable
      options={_mapOptions}
      onOptionPress={onMapChange}
    >
      <MapboxGL.MapView styleURL={styleURL} style={sheet.matchParent}>
        <MapboxGL.Camera followZoomLevel={12} followUserLocation />

        <MapboxGL.UserLocation onPress={onUserMarkerPress} />
      </MapboxGL.MapView>
    </TabBarPage>
  );
};

export default ShowMap;
