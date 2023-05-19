
# Mapbox Maps SDK for React Native

<table style="border: none; border-width: 0px">
<tr style="border: none; border-width: 0px">
<td style="border: none; border-width: 0px">
<img src="./assets/mapbox_logo.png" height="75">
</td>
<td style="border: none; border-width: 0px">
<img src="./assets/React-icon.svg" height="75">
</td>
</tr>
</table>

|  [![npm version](https://badge.fury.io/js/%40rnmapbox%2Fmaps.svg)](https://badge.fury.io/js/%40rnmapbox%2Fmaps)  | [![iOS & Android Build](https://github.com/rnmapbox/maps/actions/workflows/on-push.yml/badge.svg?branch=main)](https://github.com/rnmapbox/maps/actions/workflows/on-push.yml?branch=main)  |
|---|---|



_A community-supported, open-source React Native library for building maps with the [Mapbox Maps SDK for iOS](https://www.mapbox.com/ios-sdk/) and [Mapbox Maps SDK for Android](https://www.mapbox.com/android-sdk/)_

---
## News & Discussions
#### <span style="color:red">&rarr;</span> Call for additional maintainers [discussion thread](https://github.com/rnmapbox/maps/discussions/1551)

---

<table>
<tr>
<td colspan="2" align="center">
<img src="./assets/intro-examples.png"/>
</td>
</tr>
<tr>
<td>
<img src="./assets/beta-maps-example-point-annotation-960-d280759f6a3d8d75458f399c7a044926.webp" width="1200"/>
</td>
</tr>
<tr>
<td>
<img src="./assets/beta-maps-guides-migrate-3d-terrain-960-48b1080117817ccfd92e434d0df7546f.webp" width="1200"/>
</td>
</tr>
<tr>
<td>
<img src="./assets/maps-examples-building-extrusions-960-aaa140cce77da4e8b2dd216032b191b6.webp" width="1200"/>
</td>
</tr>

<tr>
<td>
<img src="./assets/maps-examples-data-driven-symbols-960-2e2061a6b8127ef305c1b6c159f8dc65.webp" width="1200"/>
</td>
</tr>
</table>

---

### Supported Implementations 
At the moment, the following implementations are supported: 


|*RNMapboxMapsImpl*|*Notes*|
|----------------|-----|
|mapbox|New [Mapbox v10](https://www.mapbox.com/mobile-maps-sdk) implementation - recommended|
|maplibre|[MapLibre](https://github.com/maplibre/maplibre-gl-native) opensource fork of Mapbox SDKs - will be dropped in next version|
|mapbox-gl|Legacy mapbox implementation [iOS](https://docs.mapbox.com/android/legacy/maps/guides/) [Android](https://docs.mapbox.com/ios/legacy/maps/guides/) - legacy, will be dropped in next version|

_See [iOS](ios/install.md) & [Android](android/install.md) setup guide for more details on setting `RNMapboxMapsImpl`_




## Prerequisite

1. Please [Sign Up to Mapbox](https://account.mapbox.com/auth/signup/) to get the Mapbox Access Token.


## Dependencies

- [node](https://nodejs.org)
- [npm](https://www.npmjs.com/)
- [React Native](https://facebook.github.io/react-native/) (0.64+)


## Installation

### Step 1 - Install Package:

#### Using `yarn`
Install the latest source from git:
```sh
yarn add @rnmapbox/maps
``` 

#### Using `npm`
Install the latest source from git:
```sh
npm install --save @rnmapbox/maps
``` 

#### Installing other versions

- `@rnmapbox/maps` installs the latest release from npm
- to install current `main` from github replace `@rnmapbox/maps` with `rnmapbox/maps#main`. To install specific version use `@rnmapbox/maps@10.0.4`


#### Using `expo`
Please follow the [Expo Guide](/plugin/install.md).

### Step 2 - Installation Guides:

- [Android](/android/install.md)
- [iOS](/ios/install.md)
- [Expo](/plugin/install.md)
- [Example](/example)


### Getting Started
For more information, check out our [Getting Started](/docs/GettingStarted.md) section

## Run Project
Before you run your project be sure you have completed the Installation Guides for Android or iOS.

### Run iOS Simulator
```sh
# Run with yarn
yarn run ios

# or Run with NPM
npm run ios
```

### Run Android Emulator
```sh
# Run with yarn
yarn run android

# or Run with NPM
npm run android
```

## Adding a map
```js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken('<YOUR_ACCESSTOKEN>');

const App = () => {
  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Mapbox.MapView style={styles.map} />
      </View>
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: 300,
    width: 300,
  },
  map: {
    flex: 1
  }
});
```
---
## Documentation

### Components

- [MapView](/docs/MapView.md)
- [Light](/docs/Light.md)
- [StyleSheet](/docs/StyleSheet.md)
- [PointAnnotation](/docs/PointAnnotation.md)
- [MarkerView](/docs/MarkerView.md)
- [Callout](/docs/Callout.md)
- [Camera](docs/Camera.md)
- [UserLocation](docs/UserLocation.md)
- [Images](docs/Images.md)
- [Image](docs/Image.md)

### Sources

- [VectorSource](/docs/VectorSource.md)
- [ShapeSource](/docs/ShapeSource.md)
- [RasterSource](/docs/RasterSource.md)
- [RasterDemSource](/docs/RasterDemSource.md)

### Layers

- [BackgroundLayer](/docs/BackgroundLayer.md)
- [CircleLayer](/docs/CircleLayer.md)
- [FillExtrusionLayer](/docs/FillExtrusionLayer.md)
- [FillLayer](/docs/FillLayer.md)
- [LineLayer](/docs/LineLayer.md)
- [RasterLayer](/docs/RasterLayer.md)
- [SymbolLayer](/docs/SymbolLayer.md)
- [HeatmapLayer](/docs/HeatmapLayer.md)
- [SkyLayer](/docs/SkyLayer.md)

### Terrain

- [Terrain](/docs/Terrain.md)
- [Atmosphere](/docs/Atmosphere.md)

### Offline

- [OfflineManager](/docs/OfflineManager.md)
- [SnapshotManager](/docs/snapshotManager.md)

### Misc

- [Mapbox](/docs/MapboxGL.md)
- [CustomHttpHeaders](/docs/CustomHttpHeaders.md)
- [Logger](/docs/Logger.md)

## Expo Support

This package is not available in the [Expo Go](https://expo.io/client) app. Learn how you can use it with [custom dev clients](/plugin/install.md).

## Testing with Jest

This library provides some mocks which are necessary for running tests.

Example:

```json
"jest": {
  "preset": "react-native",
  "setupFilesAfterEnv": ["@rnmapbox/maps/setup-jest"],
  "transformIgnorePatterns": [
      "node_modules/(?!(...|@rnmapbox))"
  ]
}
```
---
## Sponsors

Help drive this repo forward - be a sponsor. Add a comment [here](https://github.com/rnmapbox/maps/discussions/1551) to discuss your sponsorship.

<table style="border: none; border-width: 0px">
<tr>
<td align="center">
<a href="https://scouttohunt.com/" target="_blank">
<img src="./assets/sponsors/sth.png"
     alt="Scout To Hunt"
     height="60"
      />
      
</td>
<td align="center">
<a href="https://terrain.dance/" target="_blank">
<img src="./assets/sponsors/terrain.dance.png"
     alt="Terrain Dance LLC"
     height="60"
      />
  </a>

  
</td>
</tr>
<tr>
<td align="center"></a>

  <a href="https://scouttohunt.com/" target="_blank">Scout To Hunt</a></td>

<td align="center"><a href="https://terrain.dance/" target="_blank">Terrain Dance</a></td>
</tr>
</table>

---
## Developer Group

Have a question or need some help? Join our [Gitter developer group](https://gitter.im/rnmapbox/Lobby)!
