import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';

import sheet from '../../styles/sheet';
import { onSortOptions } from '../../utils';
import TabBarPage from '../common/TabBarPage';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';

const ShowMap = (props: BaseExampleProps) => {
  const _mapOptions = Object.keys(Mapbox.StyleURL)
    .map((key) => {
      return {
        label: key,
        data: (Mapbox.StyleURL as any)[key], // bad any, because enums
      };
    })
    .sort(onSortOptions);

  const [styleURL, setStyleURL] = useState({ styleURL: _mapOptions[0].data });

  useEffect(() => {
    Mapbox.locationManager.start();

    return (): void => {
      Mapbox.locationManager.stop();
    };
  }, []);

  const onMapChange = (index: number, newStyleURL: Mapbox.StyleURL): void => {
    setStyleURL({ styleURL: newStyleURL });
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
      <Mapbox.MapView
        styleURL={styleURL.styleURL}
        style={sheet.matchParent}
        testID={'show-map'}
      >
        <Mapbox.Camera followZoomLevel={12} followUserLocation />

        <Mapbox.UserLocation onPress={onUserMarkerPress} />
      </Mapbox.MapView>
    </TabBarPage>
  );
};

export default ShowMap;
