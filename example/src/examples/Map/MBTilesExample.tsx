import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Button,
  Platform,
} from 'react-native';
import Mapbox, {
  MapView,
  Camera,
  StyleURL,
  VectorSource,
  FillLayer,
} from '@rnmapbox/maps';
import MBTiles, { MBTilesSource } from '../../../../src/modules/MBTiles';
import type { ExampleWithMetadata } from '../common/ExampleMetadata';
import RNFS from 'react-native-fs';

//https://gist.github.com/typebrook/7d25be326f0e9afd58e0bbc333d2a175#file-mbtilessource-kt-L31-L34

/**
 * Example demonstrating how to use MBTiles files with the map
 */
const mbtilesPath =
  Platform.OS === 'android'
    ? `file:///${RNFS.DocumentDirectoryPath}/ubombo.mbtiles`
    : `file://${RNFS.LibraryDirectoryPath}/ubombo.mbtiles`;

console.log(RNFS.LibraryDirectoryPath);

const MBTilesExample = () => {
  const [source, setSource] = useState<MBTilesSource | null>(null);

  // This would be the path to your MBTiles file
  // For a real app, you might want to use ReactNative's DocumentPicker
  // to let users select their own MBTiles files

  useEffect(() => {
    // Clean up the MBTiles source when unmounting
    return () => {
      if (source) {
        console.log('Removing MBTiles source:', source.id);
        MBTiles.remove(source.id).catch(console.error);
      }
    };
  }, [source]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Dark}
        onDidFinishLoadingStyle={async () => {
          console.log('Style loaded, initializing MBTiles');
          const source = await MBTiles.initFromFile(
            mbtilesPath,
            'mbtiles-source',
          );
          setSource(source);
        }}
      >
        <Camera
          // zoomLevel={minZoom}
          // minZoomLevel={minZoom}
          // maxZoomLevel={maxZoom || 16}
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
        <Text style={styles.infoText}>Using MBTiles file: {mbtilesPath}</Text>
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
  text: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
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
  loader: {
    marginTop: 5,
  },
});

export default MBTilesExample;

const metadata: ExampleWithMetadata['metadata'] = {
  title: 'MBTiles Example',
  tags: ['MBTiles', 'Offline'],
  docs: `This example demonstrates how to use local MBTiles files with the map.

It shows loading a vector MBTiles file from the device storage and displaying it on top of a base map.

The MBTiles file is served through a local HTTP server that runs on the device.

Note: This example requires an Android device and a valid MBTiles file at the specified path.`,
};

MBTilesExample.metadata = metadata;
