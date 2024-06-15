import React from 'react';
import Mapbox from '@rnmapbox/maps';
import { StyleSheet, Text, View, LogBox, SafeAreaView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import sheet from './styles/sheet';
import colors from './styles/colors';
import { IS_ANDROID } from './utils';
import config from './utils/config';
import { Group, Item } from './scenes/GroupAndItem';
import { ScreenWithoutMap } from './scenes/ScreenWithoutMap';

LogBox.ignoreLogs([
  'Warning: isMounted(...) is deprecated',
  'Module RCTImageLoader',
]);

const styles = StyleSheet.create({
  noPermissionsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

Mapbox.setAccessToken(config.get('accessToken'));

const Stack = createNativeStackNavigator();

function AppStackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Group"
      screenOptions={{ gestureEnabled: false, headerShown: false }}
    >
      <Stack.Screen name="Group" component={Group} />
      <Stack.Screen name="Item" component={Item} />
      <Stack.Screen name="ScreenWithoutMap" component={ScreenWithoutMap} />
    </Stack.Navigator>
  );
}

const AppContainer = () => (
  <SafeAreaProvider>
    <NavigationContainer>
      <AppStackNavigator />
    </NavigationContainer>
  </SafeAreaProvider>
);
class App extends React.Component {
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
          forceInset={{ top: 'always' }}
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
