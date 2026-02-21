# Expo Installation

> :warning: This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).

First install the package with [`expo`](https://docs.expo.io/workflow/expo-cli/#expo-install), [`yarn`or `npm`](../README.md#step-1---install-package).

Install the latest release:
```sh
expo install @rnmapbox/maps
```

## Plugin Configuration

After installing this package, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.{json,config.js,config.ts}`:

```json
{
  "expo": {
    "plugins": [
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsVersion": "11.13.4"
        }
      ]
    ]
  }
}
```

If you want to show the user's current location on the map with the [UserLocation](../docs/UserLocation.md) component, you can use the [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) plugin to configure the required `NSLocationWhenInUseUsageDescription` property. Install the plugin with `npx expo install expo-location` and add its config plugin to the plugins array of your `app.{json,config.js,config.ts}`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Show current location on map."
        }
      ]
    ]
  }
}
```

Next, rebuild your app as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.

### Advanced Configuration

It's possible to overwrite the native SDK version with `RNMapboxMapsVersion`:

```json
{
  "expo": {
    "plugins": [
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsVersion": "11.16.0"
        }
      ]
    ]
  }
}
```

## Manual Setup

For bare workflow projects, you can follow the manual setup guides:

- [iOS](/ios/install.md)
- [Android](/android/install.md)
