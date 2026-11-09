Web support is work in progress, only basic map components works.

Extra steps for web:
1. Add `mapbox-gl' dependency
```
yarn add mapbox-gl
```

2. Configure web pack so that `rnmapbox/maps` is transpiled. `@expo/webpack-config` auto transpires packages starting with `react-native-` but `rnmapbox` has not `react-native in it's name, so it will not be transpired. See https://github.com/expo/expo-cli/issues/3744#issuecomment-893911288 and https://github.com/expo/expo-cli/tree/master/packages/webpack-config#include-modules : 
```
expo customize:web

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: { dangerouslyAddModulePathsToTranspile: ["@rnmapbox/maps"] },
    },
    argv
  );
  
  return config;
};

```

3. The web `MapView` adds mapbox-gl's CSS to the page itself, so no CSS loader is needed. If your app already loads `mapbox-gl/dist/mapbox-gl.css`, that stylesheet is used instead.

### Expo Snack

mapbox-gl's built-in worker fails in Expo Snack (`_ is not defined`). Load the CSP worker build instead with `Mapbox.setWorkerUrl` before rendering a `MapView`. It starts the worker as a classic worker, which the CSP worker build needs, and does nothing on iOS and Android.

```js
import { Platform } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import mapboxgl from 'mapbox-gl';

if (Platform.OS === 'web') {
  const worker = `importScripts('https://api.mapbox.com/mapbox-gl-js/v${mapboxgl.version}/mapbox-gl-csp-worker.js');`;
  Mapbox.setWorkerUrl(
    URL.createObjectURL(new Blob([worker], { type: 'text/javascript' })),
  );
}
```
