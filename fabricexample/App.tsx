// @ts-ignore
import {ACCESS_TOKEN} from '@env';

import React from 'react';
import {StyleSheet, View} from 'react-native';
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken(ACCESS_TOKEN);

const App = () => {
  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Mapbox.MapView style={styles.map} />
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: 300,
    width: 300,
  },
  map: {
    flex: 1,
  },
});
