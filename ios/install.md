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


