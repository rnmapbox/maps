import React from 'react';
import MapboxGL, {MapView, Camera} from '@react-native-mapbox-gl/maps';
import {
  Alert,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';

import sheet from '../styles/sheet';
import {DEFAULT_CENTER_COORDINATE} from '../utils';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';

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

class CacheManagement extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  state = {
    cacheSize: '',
  };

  invalidateAmbientCache = async () => {
    await MapboxGL.offlineManager.invalidateAmbientCache();
    Alert.alert('Ambient cache successfully invalidated');
  };

  resetDatabase = async () => {
    await MapboxGL.offlineManager.resetDatabase();
    Alert.alert('Database successfully reset');
  };

  clearAmbientCache = async () => {
    await MapboxGL.offlineManager.clearAmbientCache();
    Alert.alert('Ambient cache successfully cleared');
  };

  setMaximumAmbientCacheSize = async () => {
    const newMaxSize = parseInt(this.state.cacheSize, 10);
    await MapboxGL.offlineManager.setMaximumAmbientCacheSize(newMaxSize);
    Alert.alert(`Max cache size successfully set to ${newMaxSize} bytes`);
  };

  validateCacheInputValue = value => !isNaN(parseInt(value, 10));

  onChangeCacheSize = cacheSize => this.setState({cacheSize});

  render() {
    const validSizeValue = this.validateCacheInputValue(this.state.cacheSize);
    const buttonStyles = validSizeValue
      ? styles.button
      : [styles.button, {backgroundColor: 'grey'}];

    return (
      <Page {...this.props}>
        <MapView style={sheet.matchParent}>
          <Camera zoomLevel={16} centerCoordinate={DEFAULT_CENTER_COORDINATE} />
        </MapView>

        <View style={styles.controls}>
          <View style={styles.controlsContainer}>
            <View style={styles.control}>
              <TouchableOpacity
                onPress={this.invalidateAmbientCache}
                style={styles.button}>
                <Text style={styles.buttonTxt}>Invalidate cache</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.control}>
              <TouchableOpacity
                onPress={this.resetDatabase}
                style={styles.button}>
                <Text style={styles.buttonTxt}>Reset database</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.control}>
              <TextInput
                onChangeText={this.onChangeCacheSize}
                value={this.state.cacheSize}
                placeholder="New max"
                keyboardType="numeric"
                style={styles.textInput}
              />
              <TouchableOpacity
                onPress={this.setMaximumAmbientCacheSize}
                style={buttonStyles}
                disabled={!validSizeValue}>
                <Text style={styles.buttonTxt}>Set ambient max cache</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.control}>
              <TouchableOpacity
                onPress={this.clearAmbientCache}
                style={styles.button}>
                <Text style={styles.buttonTxt}>Clear ambient cache</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Page>
    );
  }
}

export default CacheManagement;
