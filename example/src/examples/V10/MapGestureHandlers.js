import React, {useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import {MapView, Camera, Logger} from '@rnmapbox/maps';
import {Text, Divider} from 'react-native-elements';

import Page from '../common/Page';

Logger.setLogLevel('verbose');

const styles = {
  map: {
    flex: 1,
  },
  info: {
    flex: 0,
    padding: 10,
  },
  divider: {
    marginVertical: 10,
  },
  fadedText: {
    color: 'gray',
  },
};

const MapGestureHandlers = props => {
  const [lastCallback, setLastCallback] = useState('');
  const [region, setRegion] = useState({});

  const properties = region?.properties;

  return (
    <Page {...props}>
      <MapView
        style={styles.map}
        onPress={e => {
          console.log(e);
        }}
        onLongPress={e => {
          console.log(e);
        }}
        onCameraChanged={_region => {
          setLastCallback('onCameraChanged');
          setRegion(_region);
        }}
        onMapIdle={_region => {
          setLastCallback('onMapIdle');
          setRegion(_region);
        }}>
        <Camera centerCoordinate={[-73.984638, 40.759211]} zoomLevel={12} />
      </MapView>

      <SafeAreaView>
        <View style={styles.info}>
          <Text style={styles.fadedText}>lastCallback</Text>
          <Text>{lastCallback}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>isUserInteraction</Text>
          <Text>{properties?.isUserInteraction ? 'Yes' : 'No'}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.fadedText}>isAnimatingFromUserInteraction</Text>
          <Text>
            {properties?.isAnimatingFromUserInteraction ? 'Yes' : 'No'}
          </Text>
        </View>
      </SafeAreaView>
    </Page>
  );
};

export default MapGestureHandlers;
