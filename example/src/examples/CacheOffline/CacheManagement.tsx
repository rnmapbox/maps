import React, { useState, useCallback } from 'react';
import Mapbox, { MapView, Camera } from '@rnmapbox/maps';
import {
  Alert,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';

import sheet from '../../styles/sheet';
import { DEFAULT_CENTER_COORDINATE } from '../../utils';
import BaseExamplePropTypes, {
  type BaseExampleProps,
} from '../common/BaseExamplePropTypes';
import { type ExampleWithMetadata } from '../common/ExampleMetadata';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: 'blue',
    borderRadius: 3,
    justifyContent: 'center',
    padding: 8,
    width: '100%',
  },
  buttonTxt: {
    color: 'white',
    textAlign: 'center',
  },
  control: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 8,
    width: '40%',
  },
  controlsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  textInput: {
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    marginBottom: 8,
    padding: 8,
    width: '100%',
  },
});

const CacheManagement: React.FC<Partial<BaseExampleProps>> = () => {
  const [cacheSize, setCacheSize] = useState('');

  const invalidateAmbientCache = useCallback(async () => {
    await Mapbox.offlineManager.invalidateAmbientCache();
    Alert.alert('Ambient cache successfully invalidated');
  }, []);

  const resetDatabase = useCallback(async () => {
    await Mapbox.offlineManager.resetDatabase();
    Alert.alert('Database successfully reset');
  }, []);

  const clearAmbientCache = useCallback(async () => {
    await Mapbox.offlineManager.clearAmbientCache();
    Alert.alert('Ambient cache successfully cleared');
  }, []);

  const setMaximumAmbientCacheSize = useCallback(async () => {
    const newMaxSize = parseInt(cacheSize, 10);
    await Mapbox.offlineManager.setMaximumAmbientCacheSize(newMaxSize);
    Alert.alert(`Max cache size successfully set to ${newMaxSize} bytes`);
  }, [cacheSize]);

  const validateCacheInputValue = useCallback(
    (value: string) => !isNaN(parseInt(value, 10)),
    [],
  );

  const onChangeCacheSize = useCallback(
    (value: string) => setCacheSize(value),
    [],
  );

  const validSizeValue = validateCacheInputValue(cacheSize);
  const buttonStyles = validSizeValue
    ? styles.button
    : [styles.button, { backgroundColor: 'grey' }];

  return (
    <>
      <MapView style={sheet.matchParent}>
        <Camera zoomLevel={16} centerCoordinate={DEFAULT_CENTER_COORDINATE} />
      </MapView>

      <View style={styles.controlsContainer}>
        <View style={styles.control}>
          <TouchableOpacity
            onPress={invalidateAmbientCache}
            style={styles.button}
          >
            <Text style={styles.buttonTxt}>Invalidate cache</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.control}>
          <TouchableOpacity onPress={resetDatabase} style={styles.button}>
            <Text style={styles.buttonTxt}>Reset database</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.control}>
          <TextInput
            onChangeText={onChangeCacheSize}
            value={cacheSize}
            placeholder="New max"
            keyboardType="numeric"
            style={styles.textInput}
          />
          <TouchableOpacity
            onPress={setMaximumAmbientCacheSize}
            style={buttonStyles}
            disabled={!validSizeValue}
          >
            <Text style={styles.buttonTxt}>Set ambient max cache</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.control}>
          <TouchableOpacity onPress={clearAmbientCache} style={styles.button}>
            <Text style={styles.buttonTxt}>Clear ambient cache</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

CacheManagement.propTypes = {
  ...BaseExamplePropTypes,
};

export default CacheManagement;

/* end-example-doc */
const metadata: ExampleWithMetadata['metadata'] = {
  title: 'CacheManagement',
  tags: [
    'Cache',
    'Cache Management',
    'Offline Manager',
    'Offline Packs',
    'Validate Cache',
    'Invalidate Cache',
    'Get Cache Size',
    'Set Max Cache Size',
  ],
  docs: `
Manages map cache.

Uses the offline manager to manage the cache and the local storage in general. Shows how to invalidate cache to remove outdated tiles, how to clear the entire local storage from tiles and offline packs and to visualize the local storage usage amount.
`,
};

(CacheManagement as unknown as ExampleWithMetadata).metadata = metadata;
