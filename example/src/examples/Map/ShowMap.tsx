import React, {FC, useState, useEffect} from 'react';
import {Alert} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../../styles/sheet';
import {onSortOptions} from '../../utils';
import TabBarPage from '../common/TabBarPage';

const ShowMap: FC<any> = props => {
  const _mapOptions = Object.keys(MapboxGL.StyleURL)
    .map(key => {
      return {
        label: key,
        data: (MapboxGL.StyleURL as any)[key], // bad any, because enums
      };
    })
    .sort(onSortOptions);

  const [styleURL, setStyleURL] = useState({styleURL: _mapOptions[0].data});

  useEffect(() => {
    MapboxGL.locationManager.start();

    return (): void => {
      MapboxGL.locationManager.stop();
    };
  }, []);

  const onMapChange = (index: number, newStyleURL: MapboxGL.StyleURL): void => {
    setStyleURL({styleURL: newStyleURL});
  };

  const onUserMarkerPress = (): void => {
    Alert.alert('You pressed on the user location annotation');
  };

  return (
    <TabBarPage
      {...props}
      scrollable
      options={_mapOptions}
      onOptionPress={onMapChange}>
      <MapboxGL.MapView styleURL={styleURL.styleURL} style={sheet.matchParent}>
        <MapboxGL.Camera followZoomLevel={12} followUserLocation />

        <MapboxGL.UserLocation onPress={onUserMarkerPress} />
      </MapboxGL.MapView>
    </TabBarPage>
  );
};

export default ShowMap;
