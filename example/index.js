import { AppRegistry } from 'react-native';

import App from './src/App';
import appConfig from './app.json';

const {
  expo: { name: appName },
} = appConfig;

AppRegistry.registerComponent(appName, () => App);
