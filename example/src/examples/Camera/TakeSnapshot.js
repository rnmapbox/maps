import React from 'react';
import { snapshotManager, StyleURL } from '@rnmapbox/maps';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import BaseExamplePropTypes from '../common/BaseExamplePropTypes';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  snapshot: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  spinnerContainer: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  button: {
    backgroundColor: '#4264fb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
});

class TakeSnapshot extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      withLogoURI: null,
      withoutLogoURI: null,
      boundsURI: null,
      loading: true,
    };
  }

  componentDidMount() {
    this.takeAllSnapshots();
  }

  async takeAllSnapshots() {
    const { width } = Dimensions.get('window');
    const snapshotWidth = width - 32;
    const snapshotHeight = 200;

    try {
      // Snapshot with logo (default)
      const withLogoURI = await snapshotManager.takeSnap({
        centerCoordinate: [-74.12641, 40.797968],
        width: snapshotWidth,
        height: snapshotHeight,
        zoomLevel: 12,
        pitch: 30,
        heading: 20,
        styleURL: StyleURL.Dark,
        writeToDisk: true,
        withLogo: true,
      });

      // Snapshot without logo
      const withoutLogoURI = await snapshotManager.takeSnap({
        centerCoordinate: [-74.12641, 40.797968],
        width: snapshotWidth,
        height: snapshotHeight,
        zoomLevel: 12,
        pitch: 30,
        heading: 20,
        styleURL: StyleURL.Dark,
        writeToDisk: true,
        withLogo: false,
      });

      // Snapshot using bounds instead of centerCoordinate
      const boundsURI = await snapshotManager.takeSnap({
        bounds: [
          [-74.2, 40.7],
          [-74.0, 40.9],
        ],
        width: snapshotWidth,
        height: snapshotHeight,
        zoomLevel: 10,
        pitch: 0,
        heading: 0,
        styleURL: StyleURL.Street,
        writeToDisk: true,
        withLogo: true,
      });

      this.setState({
        withLogoURI,
        withoutLogoURI,
        boundsURI,
        loading: false,
      });
    } catch (error) {
      console.error('Snapshot error:', error);
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, withLogoURI, withoutLogoURI, boundsURI } = this.state;

    if (loading) {
      return (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color="#4264fb" />
          <Text>Generating Snapshots...</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.label}>With Logo (withLogo: true)</Text>
          {withLogoURI && (
            <Image
              source={{ uri: withLogoURI }}
              resizeMode="contain"
              style={styles.snapshot}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Without Logo (withLogo: false)</Text>
          {withoutLogoURI && (
            <Image
              source={{ uri: withoutLogoURI }}
              resizeMode="contain"
              style={styles.snapshot}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Using Bounds (instead of centerCoordinate)
          </Text>
          {boundsURI && (
            <Image
              source={{ uri: boundsURI }}
              resizeMode="contain"
              style={styles.snapshot}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            this.setState({ loading: true });
            this.takeAllSnapshots();
          }}
        >
          <Text style={styles.buttonText}>Retake Snapshots</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

export default TakeSnapshot;
