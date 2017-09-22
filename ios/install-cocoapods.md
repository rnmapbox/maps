# Installation process with CocoaPods

If you use already [CocoaPods](https://cocoapods.org/) in your react-native
project, you can also add the react-native-mapbox-gl project to your Podfile.

1. Run `npm install --save @mapbox/react-native-mapbox-gl`
2. In your `podfile`, make sure that `platform :ios, '8.0'` is set to `8.0`
3. Add `pod 'RCTMapboxGL', :path => '../node_modules/@mapbox/react-native-mapbox-gl/ios'`
   to your `Podfile` file.
   (The path depends on your Podfile location.)
4. Open your Xcode project and ensure that the "Build Settings" parameter
   "Other linker flags" (`OTHER_LDFLAGS`) contains the CocoaPods generated
   linker options!
   * If you have used `react-native init` to setup your project you can just
     remove this parameter. Just select the line and press the Delete key.
   * Alternative, if you setup your Xcode project yourself, ensure that the
     parent configuration was included with a `$(inherited)` variable.
5. Install the new CocoaPods dependency with `pod install`.
   This command must not have output any warning. ;)

## Troubleshooting with CocoaPods

### RCTView.h file not found

Because react-native is only available as npm module (and not as "regular"
CocoaPods dependency, see [v0.13 release notes](https://github.com/facebook/react-native/releases/tag/v0.13.0)
for more informations).

So it is required that you import react-native also from a local path.
Ensure that you include `React` before you include `react-native-mapbox-gl` in
your `Podfile`. Here is a complete working example if you want add your Podfile
in the project root while your generated Xcode project is still in the `ios`
folder:

```ruby
source 'https://github.com/CocoaPods/Specs.git'

xcodeproj 'ios/YourProject'
workspace 'ios/YourProject'

pod 'React', :path => 'node_modules/react-native'
pod 'React/RCTGeolocation', :path => 'node_modules/react-native'
pod 'React/RCTImage', :path => 'node_modules/react-native'
pod 'React/RCTNetwork', :path => 'node_modules/react-native'
pod 'React/RCTText', :path => 'node_modules/react-native'
pod 'React/RCTWebSocket', :path => 'node_modules/react-native'

pod 'RCTMapboxGL', :path => 'node_modules/@mapbox/react-native-mapbox-gl/ios'
```

### NativeModules.MapboxGLManager.* not defined

Verify that your "Build Settings" parameter "Other linker flags" (`OTHER_LDFLAGS`)
is defined correctly. This is NOT the case in a `react-native init` project which doesn't
use CocoaPods. See Step 3 above!
