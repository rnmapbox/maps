import React, { useState } from 'react';
import { Text } from 'react-native';
import {
  Camera,
  FillLayer,
  MapView,
  ShapeSource,
  StyleURL,
} from '@rnmapbox/maps';

import sheet from '../../styles/sheet';
import { BaseExampleProps } from '../common/BaseExamplePropTypes';
import Page from '../common/Page';
import Bubble from '../common/Bubble';

const randomCountries = [
  {
    id: 'FRA',
    url: 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries/FRA.geo.json',
  },
  {
    id: 'GBR',
    url: 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries/GBR.geo.json',
  },
  {
    id: 'ITA',
    url: 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries/ITA.geo.json',
  },
  {
    id: 'BEL',
    url: 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries/BEL.geo.json',
  },
  {
    id: 'ESP',
    url: 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries/ESP.geo.json',
  },
];

const DynamicUrl = (props: BaseExampleProps) => {
  const [country, setCountry] = useState(randomCountries[0]);

  const handleUpdate = () => {
    const value = Math.floor(Math.random() * randomCountries.length);

    setCountry(randomCountries[value]);
  };

  return (
    <Page {...props}>
      <MapView
        styleURL={StyleURL.Satellite}
        style={sheet.matchParent}
        testID={'dynamic-url'}
      >
        <Camera
          defaultSettings={{
            centerCoordinate: [2.498873, 47.180817],
            zoomLevel: 3.25,
          }}
        />

        <ShapeSource url={country.url}>
          <FillLayer
            id="earthquakes"
            existing
            style={{
              fillColor: 'blue',
              fillOpacity: 0.25,
            }}
          />
        </ShapeSource>
      </MapView>

      <Bubble onPress={handleUpdate}>
        <Text>Update country (active: {country.id})</Text>
      </Bubble>
    </Page>
  );
};

export default DynamicUrl;
