# v1.0.0

* Adds support for Android [#97](https://github.com/mapbox/react-native-mapbox-gl/pull/97)
* Adds support for polylines and polygons on both platforms [#95](https://github.com/mapbox/react-native-mapbox-gl/pull/95)
* The `annotations` object has change:
 * Either `point`, `polyline` or `polygon` is required.
 * Removed `latitude` and `longitude` and replaced with `coordinates`. For point this a single array. For polylines and polygons, this an array of arrays.


# v0.4.2

* Updates to `mapbox-gl-naitve@2.1.2`
* With this comes many stability fixes and allows users to use mapbox gl v8 styles.

# v0.4.1

* Adds support for `react-native@0.10.0`

# v0.4.0

* Adds support for react-native `0.8.0`
* Adds support for custom annotation images
 * API looks like:
```
{
  latitude: 40.714541341726175,
  longitude:  -74.00579452514648,
  title: 'Important!',
  subtitle: 'Neat, this is a custom annotation image',
  annotationImage: {
    url: 'https://cldup.com/7NLZklp8zS.png',
    height: 25,
    width: 25
  },
  id: 'marker2'
}
```

# v0.3.0

Updates and bug fixes:
* Adds compatibility with react-native through `0.7.0`
* Updates mapbox-gl-native to `0.4.0`. You should see improved label density.
* Minor changes under the hood around propagating events
* Fixes an issue where onRegionChange and onRegionWillChange threw an error if one was not present

**Note: there is a new step added to the install process requiring you to add a `Settings.bundle` file**. Click Build Phases then Copy Bundle Resources. Click the + button. When the modal appears, click Add other. Add `node_modules/react-native-mapbox-gl/RCTMapboxGL/Settings.bundle` See [install.md](https://github.com/mapbox/react-native-mapbox-gl/blob/master/ios/install.md) for more information.
