import { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Mapbox, {
  MapView,
  Camera,
  VectorSource,
  FillLayer,
} from '@rnmapbox/maps';
import MBTiles, { MBTilesSource } from '../../../../src/modules/MBTiles';
import type { ExampleWithMetadata } from '../common/ExampleMetadata';

// Use require() to load the MBTiles file - works in both debug and release mode
// In debug: Metro serves it over HTTP, which is downloaded automatically
// In release: The file is bundled with the app as an asset
const MBTILES_SOURCE = require('../../assets/ubombo.mbtiles');

/**
 * Example demonstrating how to use MBTiles files with the map
 */
const MBTilesExample = () => {
  const [source, setSource] = useState<MBTilesSource | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clean up the MBTiles source when unmounting
    return () => {
      if (source) {
        console.log('Removing MBTiles source:', source.id);
        MBTiles.remove(source.id).catch(console.error);
      }
    };
  }, [source]);

  const handleStyleLoaded = async () => {
    try {
      console.log('Style loaded, initializing MBTiles');

      // Initialize using the new unified init() method
      // This handles require(), file paths, assets, and URLs automatically
      const mbtilesSource = await MBTiles.init(
        MBTILES_SOURCE,
        'mbtiles-source',
      );

      console.log('MBTiles source initialized:', mbtilesSource);
      setSource(mbtilesSource);
    } catch (err) {
      console.error('Failed to initialize MBTiles:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Dark}
        onDidFinishLoadingStyle={handleStyleLoaded}
      >
        <Camera
          animationMode="none"
          centerCoordinate={[31.9, -26.6]} // Approximate center for Ubombo region
        />
        {source && (
          <VectorSource id="customTiles1" tileUrlTemplates={[source.url]}>
            <FillLayer
              maxZoomLevel={source?.maxZoom}
              minZoomLevel={source?.minZoom}
              id="fields"
              sourceLayerID="ubombo_fields"
              style={{ fillColor: 'blue' }}
            />
          </VectorSource>
        )}
      </MapView>

      <View style={styles.infoPanel}>
        {error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : source ? (
          <>
            <Text style={styles.infoText}>Source ID: {source.id}</Text>
            <Text style={styles.infoText}>Format: {source.format}</Text>
            <Text style={styles.infoText}>
              Vector: {source.isVector ? 'Yes' : 'No'}
            </Text>
          </>
        ) : (
          <Text style={styles.infoText}>Loading MBTiles...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 5,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    width: '90%',
  },
});

export default MBTilesExample;

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'MBTiles Example',
  tags: ['MBTiles', 'Offline'],
  docs: `This example demonstrates how to use local MBTiles files with the map.

## Usage

The simplest way to load an MBTiles file is using require():

\`\`\`typescript
import MBTiles from '@rnmapbox/maps/src/modules/MBTiles';

// Load from bundled asset (works in debug and release)
const source = await MBTiles.init(require('./assets/map.mbtiles'));

// Or load from a file path
const source = await MBTiles.init({ filePath: 'file:///path/to/map.mbtiles' });

// Or load from app bundle asset
const source = await MBTiles.init({ asset: 'map.mbtiles' });

// Or download from a URL
const source = await MBTiles.init({ url: 'https://example.com/map.mbtiles' });
\`\`\`

The MBTiles file is served through a local HTTP server that runs on the device.`,
};

MBTilesExample.metadata = metadata;
