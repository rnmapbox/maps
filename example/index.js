console.log('index.js');
import './src/setup';
import { AppRegistry, Platform } from 'react-native';

import App from './src/App';
import appConfig from './app.json';

const {
  expo: { name: appName },
} = appConfig;

AppRegistry.registerComponent(appName, () => App);

// On native the host app starts the root component; on web nothing does.
if (Platform.OS === 'web') {
  AppRegistry.runApplication(appName, {
    rootTag: document.getElementById('root'),
  });
}
