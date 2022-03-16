import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import {StyleSheet, Text, View, LogBox, SafeAreaView} from 'react-native';
import {createStackNavigator, TransitionPresets} from 'react-navigation-stack';
import {createAppContainer} from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';

import sheet from './styles/sheet';
import colors from './styles/colors';
import {IS_ANDROID} from './utils';
import config from './utils/config';
import Home from './scenes/Home';
import Demo from './scenes/Demo';

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

MapboxGL.setAccessToken(config.get('accessToken'));

Icon.loadFont();

const AppStackNavigator = createStackNavigator(
  {
    Home: {screen: Home},
    Demo: {screen: Demo},
    Group: {screen: Home},
  },
  {
    initialRouteName: 'Home',

    navigationOptions: {
      ...TransitionPresets.SlideFromRightIOS,
    },
    defaultNavigationOptions: {
      headerShown: false,
    },
  },
);
const AppContainer = createAppContainer(AppStackNavigator);

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
      const isGranted = await MapboxGL.requestAndroidLocationPermissions();
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
          style={[sheet.matchParent, {backgroundColor: colors.primary.blue}]}
          forceInset={{top: 'always'}}>
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
