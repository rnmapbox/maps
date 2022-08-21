import { NativeModules, Platform } from 'react-native';

export default Platform.select({
  native: () => NativeModules.MGLModule,
  web: () => {
    return require('./MGLModuleForWeb').default;
  },
})();
