import React, { useState, useEffect } from 'react';
import Mapbox from '@rnmapbox/maps';
import { Button } from '@rneui/base';

import sheet from '../../styles/sheet';
import { ExampleWithMetadata } from '../common/ExampleMetadata'; // exclude-from-doc

const MapUnMount = () => {
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    Mapbox.locationManager.start();

    return (): void => {
      Mapbox.locationManager.stop();
    };
  }, []);

  return (
    <>
      <Button
        onPress={() => setIsMounted((mounted) => !mounted)}
        title={isMounted ? 'unmount MapView' : 'mount MapView'}
      />
      {isMounted ? (
        <Mapbox.MapView
          styleURL={Mapbox.StyleURL.Dark}
          style={sheet.matchParent}
          testID={'show-map'}
        >
          <Mapbox.Camera followZoomLevel={12} followUserLocation />

          <Mapbox.UserLocation />
        </Mapbox.MapView>
      ) : null}
    </>
  );
};

export default MapUnMount;

/* end-example-doc */

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'Map (un-)mount',
  tags: [],
  docs: `
Showing and hiding the the map should not lead to increased memory consumption, use this example to check it on the profiler.
`,
};
MapUnMount.metadata = metadata;
