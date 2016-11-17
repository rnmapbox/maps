#v5.1.0

* Adds prop `annotationsPopUpEnabled` and method `deselectAnnotation` [#418](https://github.com/mapbox/react-native-mapbox-gl/pull/418)
* Adds prop `pitchEnabled` [#407](https://github.com/mapbox/react-native-mapbox-gl/pull/407)
* Fixed an issue on Android where large polylines would crash the app [#412](https://github.com/mapbox/react-native-mapbox-gl/commit/353063eefce8b7529daab0b29a56884d940aef36)
* Adds methods `queryRenderedFeatures` and `visibleFeaturesAtPoint` on iOS [#419](https://github.com/mapbox/react-native-mapbox-gl/pull/419)
* Adds prop `reuseIdentifier` for custom images on iOS [#426](https://github.com/mapbox/react-native-mapbox-gl/pull/426)
* A few Cocoapod installation fixes [#450](https://github.com/mapbox/react-native-mapbox-gl/commit/abeb8b6bab288a70f8588298668998b31732ab43) [#455](https://github.com/mapbox/react-native-mapbox-gl/commit/728a1ce8f311a76eac6da60ddd32f0997a1c78f7)
* The module no longer checks for an access token on iOS since the SDK handles this [#456](https://github.com/mapbox/react-native-mapbox-gl/pull/456)

#v5.0.0

* Major breaking API changes. See the [API documentation](/API.md) for details.
* Unifies Android & iOS APIs.
* Adds support for telemetry opt-out.
* Adds offline maps support for Android.

#v4.1.1

* [Android] Fixes `Scrollable` error
* [Android] You can now properly set the size of an annotation image
* [Android & iOS] Allows for compatibility with react native v0.25+

#4.1.0

## Offline!

Offline for iOS is here! The API allows developers to specify a bounding box, min/max zoom level which will be used to download all assets to the device in the background. Once downloaded, the user can go fully offline and move their map within the boundaries specified without loading tiles from the internet.

**Be sure to check out the offline [API documentation](/ios/API.md), [walkthrough](/ios/API.md#offline) and [example](/ios/example.js#L166-L191) before starting.**

- [iOS] Adds `getBounds`
- [iOS] Adds `onTap` event handler
- [Android] Adds support for local images

#4.0.0

- [iOS] Fixes installation issues [#270](https://github.com/mapbox/react-native-mapbox-gl/issues/270)
- `styleUrl` is now `styleURL`

#v3.2.3

- [iOS] Upgrades to [v3.1.1 Mapbox iOS SDK](https://github.com/mapbox/mapbox-gl-native/releases/tag/ios-v3.1.1) internally


#v3.2.2

- [iOS] Upgrades to [v3.1.1-pre.1 Mapbox iOS SDK](https://github.com/mapbox/mapbox-gl-native/releases/tag/ios-v3.1.1-pre.1) internally

#v3.2.1

- [Android] Fixed an issue in react-native v0.19.0 that caused the map to be blank on startup
- [iOS] Fixed an issue which caused a polyline to add a point at `0,0`

#v3.2.0

#### *Note, there is a new (easier) install process for iOS. See updated [install.md](https://github.com/mapbox/react-native-mapbox-gl/blob/71298a88bba3f7b5d79e6bf1011dc8fe913b0750/ios/install.md)*

- [Android] Upgrades internally to use [Mapbox Android SDK v3.2.0](https://github.com/mapbox/mapbox-gl-native/blob/b738087080b924061c4e6ce4c8b60ae4573f4f10/CHANGELOG.md#320).
- [Android] Adds event handler `onLongPress`
- [iOS] Upgrades internally to use Mapbox iOS SDK [v3.1.0](https://github.com/mapbox/mapbox-gl-native/releases/tag/ios-v3.1.0-pre.3)
- [iOS] Adds `contentInset` option
- [iOS] Adds `userLocationVerticalAlignment`  option

#v3.1.0
 - [iOS & Android] Adds methods `getDirection` and `getCenterCoordinateZoomLevel`
 - [iOS & Android] Properly removes annotations when annotation props are updated
 - [iOS] Adds method `updateAnnotation` for updating annotations
 - [Android] The prop `rotateEnabled` has been made more consistent across both platforms.
 - [Android] Adds props `logoIsHidden` and `attributionButtonIsHidden`

#v3.0.0

With `v3.0.0` most breaking changes are around annotations. Now, to remove or select an annotation, you must provide the `id` of the annotation. On all annotations added to the map, an `id` is now required.

Example:

```js
this.selectAnnotationAnimated('the-map-ref', 'storeLocation1');
```

This will open the point annotation with `id` `storeLocation1`. The same concept is applied to removing specific annotations:

```js
this.removeAnnotation('the-map-ref', 'marker2');
```

Changes:
* [iOS & Android] Adds method `removeAllAnnotations`
* [Android] `userTrackingMode` is now configured like iOS with constants. Example: `userTrackingMode={this.userTrackingMode.none}`
* [Android] `styleURL` is now configured like iOS with constants. Example: `styleURL={this.mapStyles.emerald}`

#v2.2.0

* [iOS] Breaking change: `setVisibleCoordinateBoundsAnimated` now takes padding for top, right, bottom, left

#v2.1.4

[iOS] Adds event listeners:

* `onFinishLoadingMap`
* `onStartLoadingMap`
* `onLocateUserFailed`

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
