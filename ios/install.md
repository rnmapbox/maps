# iOS Installation


`@rnmapbox/maps` via `npm` or `yarn`.

<br/>

Add the following to your `ios/Podfile`:



```ruby
  pre_install do |installer|
    $RNMapboxMaps.pre_install(installer)
    ... other pre install hooks
  end
```

```ruby
  post_install do |installer|
    $RNMapboxMaps.post_install(installer)
    ... other post install hooks
  end
```

<br>

Run `pod install` to download the proper mapbox dependency.

```sh
# Go to the ios folder
cd ios

# Run Pod Install
pod install
```

If you want to show the user's current location on the map with the [LocationPuck](../docs/LocationPuck.md) component, you'll need to add the following property to your `Info.plist` (see [Mapbox iOS docs](https://docs.mapbox.com/ios/maps/guides/user-location/#request-temporary-access-to-full-accuracy-location) for more info):

```
<key>NSLocationWhenInUseUsageDescription</key>
<string>Show current location on map.</string>
```

You are good to go!

Read on if you want to edit your Mapbox version or flavor.

<br/>

## Using a custom version of the Mapbox SDK

You can override the version to use. *Warning:* if you set a version, then later update the `@rnmapbox/maps` library it's possible that you'll end up using an older Mapbox version than supported. Make sure you revise this value with `@rnmapbox/maps` updates. @rnmapbox/maps 10.3.12 and later need Mapbox Maps SDK 11.33.0 or newer.

```ruby
$RNMapboxMapsVersion = '= 11.33.0'
```

If using expo managed workflow, set the "RNMapboxMapsVersion" variable. See the [expo guide](/plugin/install.md)

## Using Swift Package Manager (experimental)

By default the Mapbox SDK comes from CocoaPods. To get it through Swift Package Manager instead, set this at the top of your `ios/Podfile`:

```ruby
$RNMapboxMapsSwiftPackageManager = true
```

The package requirement is derived from `$RNMapboxMapsVersion` (or the default version): `~> 11.33.0` becomes "up to next minor" from `11.33.0`, `= 11.33.0` an exact version. Your Podfile must call `react_native_post_install`, which adds the package. To override parts of the setup, pass a hash instead:

```ruby
$RNMapboxMapsSwiftPackageManager = {
  url: 'https://github.com/mapbox/mapbox-maps-ios.git',
  requirement: { kind: 'exactVersion', version: '11.33.0' },
  product_name: 'MapboxMaps',
}
```

The `rnmapbox-maps` pod links `MapboxMaps`, and `MapboxCommon`, `MapboxCoreMaps` and `Turf` are embedded by CocoaPods' `[CP] Embed Pods Frameworks` phase. Don't add the `mapbox-maps-ios` package to your app target as well, that links a second copy; `pod install` removes it if an earlier `@rnmapbox/maps` version added it.

With `link: false` the `rnmapbox-maps` pod only compiles against `MapboxMaps`, and another pod links it. Use it when another Swift package already brings the Maps SDK, for example the Mapbox Navigation SDK:

```ruby
$RNMapboxMapsSwiftPackageManager = { link: false }
```

The version the requirement resolves to must be compatible with the one the other package pins, otherwise Xcode reports a package resolution error.

With Expo, set `"RNMapboxMapsSwiftPackageManager": true` (or the hash as an object) in the plugin options. See the [expo guide](/plugin/install.md).

## Troubleshooting

### Pod install fails on upgrade of @rnmapbox/maps with `could not find compatible versions for pod "MapboxMaps"`

Example message:
```log
[!] CocoaPods could not find compatible versions for pod "MapboxMaps":
  In snapshot (Podfile.lock):
    MapboxMaps (= 10.15.0, ~> 10.15.0)

  In Podfile:
    rnmapbox-maps (from `../node_modules/@rnmapbox/maps`) was resolved to 10.0.15, which depends on
      MapboxMaps (~> 10.16.0)
```

Please use `pod update MapboxMaps` as suggested by cocoapods


