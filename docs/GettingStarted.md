# Getting Started

Congratulations, you successfully installed rnmapbox/maps! 🎉
Where to go from here?
You can head straight to [examples](/example) folder if you want to jump into the deep end.
However, if you prefer an easier ramp-up, then make sure to stick around and check out the guides below.

## Setting your accessToken

In order to work, mapbox requires you to create an accessToken and set it in your app.
If you haven't created one yet, make sure to sign up for an account [here](https://www.mapbox.com/signup/)
You can create and manage your access tokens on your [Mapbox Account page](https://www.mapbox.com/account/)
Once you have your accessToken, set it like this

```js
import MapboxGL from "@rnmapbox/maps";

MapboxGL.setAccessToken("<YOUR_ACCESSTOKEN>");
```

## Setting connection status [Android only]

If you are hosting styles and sources on localhost, you might need to set the connection status manually for Mapbox to be able to use them. See [mapbox/mapbox-gl-native#12819](https://github.com/mapbox/mapbox-gl-native/issues/12819).

Manually sets the connectivity state of the app, bypassing any checks to the ConnectivityManager. Set to `true` for connected, `false` for disconnected, and `null` for ConnectivityManager to determine.

```js
import MapboxGL from "@rnmapbox/maps";

MapboxGL.setConnected(true);
```

## Disabling Telemetry

By default mapbox collects telemetry.
If you would like to programmatically disable this within your app add the code below.

```js
  componentDidMount() {
    MapboxGL.setTelemetryEnabled(false);
  }
```

For more information on mapbox and telemetry: [https://www.mapbox.com/telemetry](https://www.mapbox.com/telemetry)

## Show a map

```js
import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import MapboxGL from "@rnmapbox/maps";

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
  componentDidMount() {
    MapboxGL.setTelemetryEnabled(false);
  }

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
