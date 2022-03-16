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

Running `pod install` will add MapLibre SDK via SwiftPackageManager

```sh
# Go to the ios folder
cd ios

# Run Pod Install
pod install
```

You are good to go!

Read on if you want to edit your Mapbox version or flavor.

<br>

## Maplibre

[MapLibre](https://github.com/maplibre/maplibre-gl-native) is an OSS fork of MapboxGL

Current default MapLibre version is `5.12.0`

This is the dafult and requires no further setup`ios/Podfile`

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

## Mapbox Maps SDK (v10)

Check the current version of the SDK [here](https://docs.mapbox.com/ios/maps/overview/).

```ruby
$RNMapboxMapsImpl = 'mapbox'
$RNMapboxMapsVersion = '~> 10.3.0'
```

You will need to authorize your download of the Maps SDK with a secret access token with the `DOWNLOADS:READ` scope. This [guide](https://docs.mapbox.com/ios/maps/guides/install/#configure-credentials) explains how to configure the secret token under section `Configure your secret token`.

<br/>

## Mapbox Maps GL SDK (9.0 or earlies)

This is the old version of mapbox gl (deprecated)

```ruby
$RNMapboxMapsImpl = 'mapbox-gl'
$RNMapboxMapsVersion = '~> 5.9.0'
```

### Mapbox Maps GL SDK > `v6.0.0`

If you are using version `v6.0.0` of the SDK or later, you will need to authorize your download of the Maps SDK with a secret access token with the `DOWNLOADS:READ` scope. This [guide](https://docs.mapbox.com/ios/maps/guides/install/#configure-credentials) explains how to configure the secret token under section `Configure your secret token`.

<br>

