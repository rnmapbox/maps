import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {StyleSheet, Text, View, YellowBox} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import {createStackNavigator} from 'react-navigation';
import CardStackStyleInterpolator from 'react-navigation-stack/dist/views/StackView/StackViewStyleInterpolator'; // eslint-disable-line import/no-extraneous-dependencies
import Icon from 'react-native-vector-icons/MaterialIcons';

import sheet from './styles/sheet';
import colors from './styles/colors';
import {IS_ANDROID} from './utils';
import config from './utils/config';
import Home from './scenes/Home';
import Demo from './scenes/Demo';

// :(
YellowBox.ignoreWarnings([
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
  },
  {
    initialRouteName: 'Home',

    navigationOptions: {
      header: null,
    },

    transitionConfig: () => ({
      screenInterpolator: props =>
        CardStackStyleInterpolator.forVertical(props),
    }),
  },
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
    return <AppStackNavigator />;
  }
}

export default App;
