import { useState } from 'react';
import { Text } from 'react-native';
import Mapbox from '@rnmapbox/maps';

import sheet from '../../styles/sheet';

const MapLoaded = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Mapbox.MapView
        style={sheet.matchParent}
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
