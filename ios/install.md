# iOS Installation

## React-Native > `0.60.0`

If you are using autolinking feature introduced in React-Native `0.60.0`, you just need `npm install @react-native-mapbox-gl/maps`, 

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


followed by `pod install` from the `ios` directory. Please also add the pre/post install cocoapods hooks.

## Using CocoaPods without autolink

To install with CocoaPods, add the following to your `Podfile`:

```ruby
  # Mapbox
  pod 'react-native-mapbox-gl', :path => '../node_modules/@react-native-mapbox-gl/maps'

```

Then run `pod install` and rebuild your project.


## Mapbox Maps SDK

It is possible to set a custom version of the Mapbox SDK: 

### New version - since `8.1rc5`

Add the following to you `ios/Podfile`:

```ruby
$ReactNativeMapboxGLIOSVersion = '~> 6.1'
```

Check the current version of the SDK [here](https://docs.mapbox.com/ios/maps/overview/).

### Mapbox Maps SDK > `v6.0.0`

If you are using version `v6.0.0` of the SDK or later, you will need to authorize your download of the Maps SDK with a secret access token with the `DOWNLOADS:READ` scope. This [guide](https://docs.mapbox.com/ios/maps/overview/#install-the-sdk) explains how to configure the secret token under section `Configure your secret token`.

### Maplibre

## Using MapLibre

[MapLibre](https://github.com/maplibre/maplibre-gl-native) is an OSS fork of MapboxGL

Overwrite mapbox dependecies within your `ios/Podfile`:



```
$RNMBGL_Use_SPM = {
  url: "https://github.com/maplibre/maplibre-gl-native-distribution",
  requirement: {
    kind: "upToNextMajorVersion",
    minimumVersion: "5.11.0"
  },
  product_name: "Mapbox"
}

pre_install do |installer|
  $RNMBGL.pre_install(installer)
  ...
end

post_install do |installer|
  $RNMBGL.post_install(installer)
  ...
end

```
