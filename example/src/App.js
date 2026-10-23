import React from 'react';
import Mapbox from '@rnmapbox/maps';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import sheet from './styles/sheet';
import colors from './styles/colors';
import { IS_ANDROID } from './utils';
import config from './utils/config';
import { exampleLinkingScreens, exampleScreens } from './scenes/GroupAndItem';
import { ScreenWithoutMap } from './scenes/ScreenWithoutMap';
import MapInModal from './examples/Map/MapInModal';

const styles = StyleSheet.create({
  noPermissionsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

Mapbox.addCustomHeader('Custom-Header', 'global-header-value');
Mapbox.addCustomHeader('Mapbox-Api-Header-Value', 'api-header-value', {
  urlRegexp: '^https:\/\/api\.mapbox\.com\/(.*)$',
});
// This header will not be added to requests to api.mapbox.com
Mapbox.addCustomHeader('Other-Api-Header-Value', 'other-api-header-value', {
  urlRegexp: '^https:\/\/api\.other\.com\/(.*)$',
});
Mapbox.setAccessToken(config.get('accessToken'));

console.log('### App.js - Mapbox:', Mapbox);

const Stack = createNativeStackNavigator();

function AppStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ gestureEnabled: false, headerShown: false }}
    >
      {exampleScreens()}
      <Stack.Screen name="ScreenWithoutMap" component={ScreenWithoutMap} />
      <Stack.Group
        screenOptions={() => ({
          presentation: 'modal',
        })}
      >
        <Stack.Screen name="MapInModal" component={MapInModal} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

// Web only: on native this would also start handling incoming app links.
// The base URL is part of the screen paths, as React Navigation's `config.path`
// doesn't match the bare base URL.
const linking =
  Platform.OS === 'web'
    ? {
        prefixes: [],
        config: {
          initialRouteName: 'Home',
          screens: exampleLinkingScreens(process.env.EXPO_BASE_URL ?? '', [
            'ScreenWithoutMap',
            'MapInModal',
          ]),
        },
      }
    : undefined;

const AppContainer = () => (
  <SafeAreaProvider>
    <NavigationContainer linking={linking}>
      <AppStackNavigator />
    </NavigationContainer>
  </SafeAreaProvider>
);
class App extends React.Component {
  // @ts-ignore - Parameter type requires TypeScript annotation
  constructor(props) {
    super(props);

    this.state = {
      isFetchingAndroidPermission: IS_ANDROID,
      isAndroidPermissionGranted: false,
      activeExample: -1,
    };
  }

  async componentDidMount() {
    if (IS_ANDROID) {
      const isGranted = await Mapbox.requestAndroidLocationPermissions();
      this.setState({
        isAndroidPermissionGranted: isGranted,
        isFetchingAndroidPermission: false,
      });
    }
  }

  render() {
    if (IS_ANDROID && !this.state.isAndroidPermissionGranted) {
      if (this.state.isFetchingAndroidPermission) {
        return null;
      }
      return (
        <SafeAreaView
          style={[sheet.matchParent, { backgroundColor: colors.primary.blue }]}
        >
          <View style={sheet.matchParent}>
            <Text style={styles.noPermissionsText}>
              You need to accept location permissions in order to use this
              example applications
            </Text>
          </View>
        </SafeAreaView>
      );
    }
    return <AppContainer />;
  }
}

export default App;
