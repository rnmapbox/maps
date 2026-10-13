import React from 'react';
import { MapView, RasterLayer, RasterSource, Camera } from '@rnmapbox/maps';

const styles = {
  matchParent: { flex: 1 },
};

export default function RasterSourceTileRequestsExample() {
  return (
    <MapView style={styles.matchParent}>
      <Camera
        defaultSettings={{
          centerCoordinate: [-74.00597, 40.71427],
          zoomLevel: 10,
        }}
      />
      <RasterSource
        id="osm-tiles"
        tileSize={256}
        prefetchZoomDelta={0}
        tileNetworkRequestsDelay={200}
        tileUrlTemplates={['https://tile.openstreetmap.org/{z}/{x}/{y}.png']}
      />
      <RasterLayer
        id="osm-tiles-layer"
        sourceID="osm-tiles"
        style={{ rasterOpacity: 0.85 }}
      />
    </MapView>
  );
}

/* end-example-doc */

/**
 * @typedef {import('../common/ExampleMetadata').ExampleWithMetadata} ExampleWithMetadata
 * @type {ExampleWithMetadata['metadata']}
 */
const metadata = {
  title: 'Raster Source tile requests',
  tags: [
    'RasterSource',
    'RasterSource#prefetchZoomDelta',
    'RasterSource#tileNetworkRequestsDelay',
  ],
  docs: `
Fetches only the tiles of the current zoom level (no parent tiles as a placeholder) and waits 200 ms
before requesting tiles while the map pans, so tiles that leave the screen during a fast pan are
never requested. Watch the network log while panning to compare with the Raster Source example.
`,
};
RasterSourceTileRequestsExample.metadata = metadata;
