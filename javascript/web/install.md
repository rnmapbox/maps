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
