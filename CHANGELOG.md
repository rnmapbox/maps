#v2.1.3

* [iOS] Adds props `attributionButtonIsHidden`, `logoIsHidden` and `compassIsHidden` for showing and hiding their respective view.

#v2.1.2

* [Android] fixes a missing prop type bug [#175](https://github.com/mapbox/react-native-mapbox-gl/issues/175)

#v2.1.0

* Adds support for `react-native@0.16.0`
* [iOS] Adds event handler `onTap`. Fired when user taps screen. Returns lat,lng and xy screen coordinates
* [iOS] Adds event handler `onLongPress`. Fired when user taps and holds screen for 1 second. Returns lat,lng and xy screen coordinates

# v2.0.0

* [iOS] Adds optional pod installation
* [iOS] If showsUserLocation is false the Mapbox layer will no longer require location permissions
* [iOS] Fixed a bug where icons would overwrite other icons
* [iOS] Minimum deployment level set to 7.0
* [iOS] Fixed a bug where when returning to map/rotating the UI, markers would disappear
* [iOS] An empty popup will no longer be shown when there is no title and text
* [iOS] Adds userTrackingMode
* [Android] Upgrades to react-native v0.14.x

### Breaking changes
iOS no longer supports the `assets://` path for styles. Styles can be set via normal `mapbox://` url or via:

```js
this.mapStyles.light
this.mapStyles.streets
this.mapStyles.dark
this.mapStyles.satellite
this.mapStyles.hybrid
this.mapStyles.emerald
```

`this.mapStyles` is passed in via mixins. If you prefer not pass in mixins, you can just as easily reference the emerald style via `styleURL={'mapbox://styles/mapbox/emerald-v8'}`

# v1.1.0

* Fixed a regression in the `Header Search Paths`
* [iOS] added new function `setVisibleCoordinateBoundsAnimated()`
* [Android] `showsUserLocation` properly shows the users correct location
* Updates Android to `mapbox-gl-naitve@v2.2.0`

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
