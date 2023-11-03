import React, { useState } from 'react';
import { Text } from 'react-native';
import {
  Camera,
  FillLayer,
  MapView,
  ShapeSource,
  StyleURL,
} from '@rnmapbox/maps';

import Bubble from '../common/Bubble';
import { ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

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

const styles = { matchParent: { flex: 1 } };

const DynamicUrl = () => {
  const [country, setCountry] = useState(randomCountries[0]);

  const handleUpdate = () => {
    const index = Math.floor(Math.random() * randomCountries.length);

    setCountry(randomCountries[index]);
  };

  return (
    <>
      <MapView
        styleURL={StyleURL.Satellite}
        style={styles.matchParent}
        testID={'dynamic-url'}
      >
        <Camera
          defaultSettings={{
            centerCoordinate: [2.498873, 47.180817],
            zoomLevel: 3.25,
          }}
        />

        <ShapeSource id="countryShapeSource" url={country.url}>
          <FillLayer
            id="countryFillLayer"
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
    </>
  );
};

export default DynamicUrl;

/* end-example-doc */

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Dynamic URL',
  tags: ['ShapeSource#url'],
  docs: `
Change shape source URL on press of the bubble.
`,
};
DynamicUrl.metadata = metadata;
