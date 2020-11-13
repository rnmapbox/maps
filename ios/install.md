# iOS Installation

## React-Native > `0.60.0`

If you are using autolinking feature introduced in React-Native `0.60.0`, you just need `npm install @react-native-mapbox-gl/maps`, followed by `pod install` from the `ios` directory.

## Using CocoaPods

To install with CocoaPods, add the following to your `Podfile`:

```ruby
  # Mapbox
  pod 'react-native-mapbox-gl', :path => '../node_modules/@react-native-mapbox-gl/maps'

```

Then run `pod install` and rebuild your project.

## use_frameworks!

Mapbox normally [requires](https://github.com/mapbox/mapbox-gl-native-ios/issues/154) `use_frameworks!` in cocoapods. By default we implement a [workaround](https://github.com/react-native-mapbox-gl/maps/pull/714). In case you need `use_frameworks!` for some reason, you can use the mapbox pod without the workaround with the `DynamicLibrary` subspec:


```ruby
  # Mapbox
  pod 'react-native-mapbox-gl/DynamicLibrary', :path => '../node_modules/@react-native-mapbox-gl/maps'

  ...

  use_frameworks!

```

## Mapbox Maps SDK

It is possible to set a custom version of the Mapbox SDK: 

### New version - since `8.1rc5`

Add the following to you `ios/Podfile`:

```ruby
$ReactNativeMapboxGLIOSVersion = '~> 6.1'
```

Check the current version of the SDK [here](https://docs.mapbox.com/ios/maps/overview/).

### Deprecated version

REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION="~> 5.7" pod install

```ruby
REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION="~> 5.6.0" pod install --repo-update
```
or add

```ruby
ENV['REACT_NATIVE_MAPBOX_MAPBOX_IOS_VERSION'] = '~> 5.6.0'
```

to your podfile before

```ruby
use_native_modules!
```

### Mapbox Maps SDK > `v6.0.0`

If you are using version `v6.0.0` of the SDK or later, you will need to authorize your download of the Maps SDK with a secret access token with the `DOWNLOADS:READ` scope. This [guide](https://docs.mapbox.com/ios/maps/overview/#install-the-sdk) explains how to configure the secret token under section `Configure your secret token`.
