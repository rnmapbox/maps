# Expo installation

> :warning: This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).

First install the package with [`expo`](https://docs.expo.io/workflow/expo-cli/#expo-install), `yarn` or `npm`. If you want to install the latest source from git you have to use [`yarn`& `npm`](../README.md#step-1---install-package).

Installing a v10 beta ([find the latest beta release](https://github.com/rnmapbox/maps/releases)):
```sh
expo install @rnmapbox/maps@10.0.0-beta.33
```

After installing this package, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsImpl": "maplibre"
        }
      ]
    ]
  }
}
```

Next, rebuild your app as described in the ["Adding custom native code"](https://docs.expo.io/workflow/customizing/) guide.

For `mapbox` or `mapbox-gl` you'll need to provide `RNMapboxMapsDownloadToken` as well.

```json
{
  "expo": {
    "plugins": [
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsImpl": "mapbox",
          "RNMapboxMapsDownloadToken": "sk.ey...qg"
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
