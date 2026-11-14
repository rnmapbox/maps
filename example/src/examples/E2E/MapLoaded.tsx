import { useState } from 'react';
import { Text } from 'react-native';
import Mapbox from '@rnmapbox/maps';

import sheet from '../../styles/sheet';

// Needs no network, so the e2e test checks the map itself, not the runner's connection to Mapbox
const styleJSON = JSON.stringify({
  version: 8,
  sources: {
    square: {
      type: 'geojson',
      data: {
        type: 'Polygon',
        coordinates: [
          [
            [19.02, 47.49],
            [19.06, 47.49],
            [19.06, 47.51],
            [19.02, 47.51],
            [19.02, 47.49],
          ],
        ],
      },
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#dfe8d4' },
    },
    {
      id: 'square',
      type: 'fill',
      source: 'square',
      paint: { 'fill-color': '#3b82f6' },
    },
  ],
});

const MapLoaded = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Mapbox.MapView
        style={sheet.matchParent}
        styleJSON={styleJSON}
        testID="e2e-map"
        onDidFinishLoadingMap={() => setLoaded(true)}
      >
        <Mapbox.Camera
          defaultSettings={{ centerCoordinate: [19.04, 47.5], zoomLevel: 12 }}
        />
      </Mapbox.MapView>
      {loaded && <Text testID="e2e-map-loaded">Map loaded</Text>}
    </>
  );
};

MapLoaded.metadata = { title: 'Map Loaded' };

export default MapLoaded;
