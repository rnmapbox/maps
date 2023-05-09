# iOS Installation

## React-Native > `0.60.0`

The following assumes, that you're using autolinking and installed

`@rnmapbox/maps` via `npm` or `yarn`.

<br>

The following is required for every following setup

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

Set the `$RNMapboxMapsImpl` to `mapbox` aka v10 implementation [see bellow for detailed instructions](#mapbox-maps-sdk-v10)

Run `pod install` to download the proper mapbox dependency. You may need to run `pod repo update` if you get an error of ` CocoaPods could not find compatible versions for pod "MapboxMaps"`

```sh
# Go to the ios folder
cd ios

# Run Pod Install
pod install
```

If you want to show the user's current location on the map with the [UserLocation](../docs/UserLocation.md) component, you'll need to add the following property to your `Info.plist` (see [Mapbox iOS docs](https://docs.mapbox.com/ios/maps/guides/user-location/#request-temporary-access-to-full-accuracy-location) for more info):

```
<key>NSLocationWhenInUseUsageDescription</key>
<string>Show current location on map.</string>
```

You are good to go!

Read on if you want to edit your Mapbox version or flavor.

<br>

## Mapbox Maps SDK (v10)

This is the version we recommend, while other implementations should work, we don't plan to support them in next version.

Check the current version of the SDK [here](https://docs.mapbox.com/ios/maps/overview/).

Add the following to the beginning of your podfile
```ruby
$RNMapboxMapsImpl = 'mapbox'
```

You can also override the version to use. *Warning:* if you set a version, then later update, the `rnamapbox/maps` library it's possible that you'll end up using Mapbox older version than supported. Make sure you revise this value with `rnmapbox/maps` updates.

```ruby
# Warning: only for advanced use cases, only do this if you know what you're doing.
# $RNMapboxMapsVersion = '~> 10.12.0'
```

You will need to authorize your download of the Maps SDK with a secret access token with the `DOWNLOADS:READ` scope. This [guide](https://docs.mapbox.com/ios/maps/guides/install/#configure-credentials) explains how to configure the secret token under section `Configure your secret token`.

<br/>

## Maplibre

[MapLibre](https://github.com/maplibre/maplibre-gl-native) is an OSS fork of MapboxGL

Current default MapLibre version is `5.12.0`

This is the default and requires no further setup`ios/Podfile`

If you want to change the version used:

```ruby
$RNMapboxMapsImpl = 'maplibre' # optional as this is the default
$RNMapboxMapsVersion = 'exactVersion 5.12.1'
```

MapLibre is consumed via Swift Package Manager, use `RNMapboxMapsSwiftPackageManager` to change other details than version

```ruby
$RNMapboxMapsSwiftPackageManager = {
    url: "https://github.com/maplibre/maplibre-gl-native-distribution",
    requirement: {
      kind: "upToNextMajorVersion",
      minimumVersion: "5.12.1"
    },
    product_name: "Mapbox"
  }
```

<br/>

## Mapbox Maps GL SDK (9.0 or earlier)

This is the old version of mapbox gl (deprecated)

```ruby
$RNMapboxMapsImpl = 'mapbox-gl'
$RNMapboxMapsVersion = '~> 5.9.0'
```

### Mapbox Maps GL SDK > `v6.0.0`

If you are using version `v6.0.0` of the SDK or later, you will need to authorize your download of the Maps SDK with a secret access token with the `DOWNLOADS:READ` scope. This [guide](https://docs.mapbox.com/ios/maps/guides/install/#configure-credentials) explains how to configure the secret token under section `Configure your secret token`.

<br>

