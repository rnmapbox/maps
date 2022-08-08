# Expo installation

> This package cannot be used in the "Expo Go" app because [it requires custom native code](https://docs.expo.io/workflow/customizing/).

First install the package with yarn, npm, or [`expo install rnmapbox/maps#main`](https://docs.expo.io/workflow/expo-cli/#expo-install).

```sh
expo install rnmapbox/maps#main
```

After installing this npm package, add the [config plugin](https://docs.expo.io/guides/config-plugins/) to the [`plugins`](https://docs.expo.io/versions/latest/config/app/#plugins) array of your `app.json` or `app.config.js`:

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
          "RNMapboxMapsImpl": "maplibre",
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
