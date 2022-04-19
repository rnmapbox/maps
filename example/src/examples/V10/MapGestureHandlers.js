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
};

const MapGestureHandlers = props => {
  const [region, setRegion] = useState({});

  const properties = region?.properties;

  return (
    <Page {...props}>
      <MapView
        style={styles.map}
        onRegionWillChange={_region => setRegion(_region)}
        onRegionIsChanging={_region => setRegion(_region)}
        onRegionDidChange={_region => setRegion(_region)}>
        <Camera centerCoordinate={[-73.984638, 40.759211]} zoomLevel={12} />
      </MapView>

      <SafeAreaView>
        <View style={styles.info}>
          <Text>Interacting:</Text>
          <Text h4={true}>{properties?.isUserInteraction ? 'Yes' : 'No'}</Text>
          <Divider style={styles.divider} />
          <Text>Animating from interaction:</Text>
          <Text h4={true}>
            {properties?.isAnimatingFromUserInteraction ? 'Yes' : 'No'}
          </Text>
        </View>
      </SafeAreaView>
    </Page>
  );
};

export default MapGestureHandlers;
