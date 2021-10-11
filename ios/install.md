# iOS Installation

## React-Native > `0.60.0`

The following assumes, that you're using autolinking and installed

`@react-native-mapbox-gl/maps` via `npm` or `yarn`.

<br>

The following is required for every following setup

Add the following to your `ios/Podfile`:

```ruby
  pre_install do |installer|
    $RNMBGL.pre_install(installer)
    ... other pre install hooks
  end
```

```ruby
  post_install do |installer|
    $RNMBGL.post_install(installer)
    ... other post install hooks
  end
```

Running `pod install` will add Mapbox iOS SDK `5.8.0`

```sh
# Go to the ios folder
cd ios

# Run Pod Install
pod install
```

You are good to go!

Read on if you want to edit your Mapbox version or flavor.

<br>

## Mapbox Maps SDK

It is possible to set a custom version of the Mapbox SDK:

### New version - since `8.1rc5`

Add the following to you `ios/Podfile`:

```ruby
$ReactNativeMapboxGLIOSVersion = '~> 6.1'
```

Check the current version of the SDK [here](https://docs.mapbox.com/ios/maps/overview/).

### Mapbox Maps SDK > `v6.0.0`

If you are using version `v6.0.0` of the SDK or later, you will need to authorize your download of the Maps SDK with a secret access token with the `DOWNLOADS:READ` scope. This [guide](https://docs.mapbox.com/ios/maps/guides/install/#configure-credentials) explains how to configure the secret token under section `Configure your secret token`.

<br>

## Maplibre

[MapLibre](https://github.com/maplibre/maplibre-gl-native) is an OSS fork of MapboxGL

Current default MapLibre version is `5.12.0`

If you want to use that, simply add this to your `ios/Podfile`

```ruby
$RNMBGL_Use_SPM = true
$RNMGL_USE_MAPLIBRE = true
```

If you want to adjust/ edit your MapLibre version you can also pass a hash

Example overwrite within your `ios/Podfile`:

```ruby
$RNMBGL_Use_SPM = {
  url: "https://github.com/maplibre/maplibre-gl-native-distribution",
  requirement: {
    kind: "upToNextMajorVersion",
    minimumVersion: "5.12.0"
  },
  product_name: "Mapbox"
}
$RNMGL_USE_MAPLIBRE = true
```


<br>

## React-Native < `0.60.0`

### Using CocoaPods without autolink

To install with CocoaPods, add the following to your `Podfile`:

```ruby
  # Mapbox
  pod 'react-native-mapbox-gl', :path => '../node_modules/@react-native-mapbox-gl/maps'

```

Then run `pod install` and rebuild your project.
