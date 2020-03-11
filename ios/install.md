# iOS Installation

## Using CocoaPods

To install with CocoaPods, add the following to your `Podfile`:

```
  # Mapbox
  pod 'react-native-mapbox-gl', :path => '../node_modules/@react-native-mapbox-gl/maps'

  # Make also sure you have use_frameworks! enabled
  use_frameworks!
```

Then run `pod install` and rebuild your project.

If you cannot use `use_frameworks!` for some reason, please see our workaround - https://github.com/react-native-mapbox-gl/maps/pull/714

## React-Native > `0.60.0`

If you are using autolinking feature introduced in React-Native `0.60.0` you do not need any additional steps.

Checkout the [example application](/example/README.md) to see how it's configured for an example.
