# iOS Installation

## React-Native >= `0.62.0`

To install with CocoaPods, add the following to your `Podfile`:

```
  # Mapbox
  pod 'react-native-mapbox-gl', :path => '../node_modules/@react-native-mapbox-gl/maps'

  # Workaround if use_frameworks! failed
  pod 'NoUseFrameworks-MapboxMobileEvents',  :podspec => '../node_modules/@react-native-mapbox-gl/maps/ios/NoUseFrameworks-MapboxMobileEvents/NoUseFrameworks-MapboxMobileEvents.podspec.json'
```

## React-Native = `0.61.0`

To install with CocoaPods, add the following to your `Podfile`:

```
  # Mapbox
  pod 'react-native-mapbox-gl', :path => '../node_modules/@react-native-mapbox-gl/maps'

  use_frameworks!
```

## React-Native > `0.60.0`

If you are using autolinking feature introduced in React-Native `0.60.0` you do not need any additional steps.

Checkout the [example application](/example/README.md) to see how it's configured for an example.
