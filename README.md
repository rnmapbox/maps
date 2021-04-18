# Mapbox Maps SDK for React Native

_An unofficial React Native library for building maps with   
the [Mapbox Maps SDK for iOS](https://www.mapbox.com/ios-sdk/) and [Mapbox Maps SDK for Android](https://www.mapbox.com/android-sdk/)_


We also support [MapLibre](https://github.com/maplibre/maplibre-gl-native) flavors of Mapbox SDKs now 🎉

<br>

---

[![npm version](https://badge.fury.io/js/%40react-native-mapbox-gl%2Fmaps.svg)](https://badge.fury.io/js/%40react-native-mapbox-gl%2Fmaps)  
[![Android Build](https://github.com/react-native-mapbox-gl/maps/actions/workflows/android-actions.yml/badge.svg)](https://github.com/react-native-mapbox-gl/maps/actions/workflows/android-actions.yml)  
[![iOS Build](https://github.com/react-native-mapbox-gl/maps/actions/workflows/ios-actions.yml/badge.svg)](https://github.com/react-native-mapbox-gl/maps/actions/workflows/ios-actions.yml)  

---

<br>

<img src="./assets/indoor_building_map_android.png"
     alt="Indoor Building Map Android"
     height="300"
      />
<img src="./assets/indoor_building_map_ios.png"
     alt="Indoor Building Map iOS"
     height="300"
      />

## Installation
### Prerequisit
On Android we support from version 6 (API 23) upwards  


### Dependencies

- [node](https://nodejs.org)
- [npm](https://www.npmjs.com/)
- [React Native](https://facebook.github.io/react-native/) (0.60+)

### Git

```
git clone git@github.com:react-native-mapbox-gl/maps.git
cd maps
```

### Yarn

```
yarn add @react-native-mapbox-gl/maps
```

### Npm

```
npm install @react-native-mapbox-gl/maps --save
```

## Installation Guides

- [Android](/android/install.md)
- [iOS](/ios/install.md)
- [Example](/example)

## Getting Started
For more information, check out our [Getting Started](/docs/GettingStarted.md) section

### Adding a map

```js
import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import MapboxGL from "@react-native-mapbox-gl/maps";

MapboxGL.setAccessToken("<YOUR_ACCESSTOKEN>");

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  container: {
    height: 300,
    width: 300,
    backgroundColor: "tomato"
  },
  map: {
    flex: 1
  }
});

export default class App extends Component {
  render() {
    return (
      <View style={styles.page}>
        <View style={styles.container}>
          <MapboxGL.MapView style={styles.map} />
        </View>
      </View>
    );
  }
}
```

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

### Sources

- [VectorSource](/docs/VectorSource.md)
- [ShapeSource](/docs/ShapeSource.md)
- [RasterSource](/docs/RasterSource.md)

### Layers

- [BackgroundLayer](/docs/BackgroundLayer.md)
- [CircleLayer](/docs/CircleLayer.md)
- [FillExtrusionLayer](/docs/FillExtrusionLayer.md)
- [FillLayer](/docs/FillLayer.md)
- [LineLayer](/docs/LineLayer.md)
- [RasterLayer](/docs/RasterLayer.md)
- [SymbolLayer](/docs/SymbolLayer.md)
- [HeatmapLayer](/docs/HeatmapLayer.md)

### Offline

- [OfflineManager](/docs/OfflineManager.md)
- [SnapshotManager](/docs/snapshotManager.md)

### Misc

- [MapboxGL](/docs/MapboxGL.md)
- [CustomHttpHeaders](/docs/CustomHttpHeaders.md)

## Expo Support

We have a feature request open with Expo if you want to see it get in show your support https://expo.canny.io/feature-requests/p/add-mapbox-gl-support

## Testing with Jest

This library provides some mocks which are necessary for running tests.

Example:

```json
"jest": {
  "preset": "react-native",
  "setupFilesAfterEnv": ["@react-native-mapbox-gl/maps/setup-jest"]
}
```

## Developer Group

Have a question or need some help? Join our [Gitter developer group](https://gitter.im/react-native-mapbox-gl/Lobby)!
