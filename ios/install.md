# Installation Process

## Use CocoaPods

If you use already [CocoaPods](https://cocoapods.org/)
in your react-native project, you can also add the react-native-mapbox-gl project
to your Podfile.

1. Run `npm install --save react-native-mapbox-gl`
2. Add `pod 'RCTMapboxGL', :path => 'node_modules/react-native-mapbox-gl/ios'` to your `Podfile` file.  
   (The path dependence on your Podfile location.)
3. Open your Xcode project and ensure that the "Build Settings" parameter "Other linker flags" (`OTHER_LDFLAGS`) contains the CocoaPods generated linker options!
   * If you have used `react-natve init` to setup your project you can just remove this paramter. Just select the line and press the delete (backspace) key.
   * Alternative, if you setup your Xcode project yourself, ensure that the parent configuration was included with a `$(inherited)` variable.
4. Install the new CocoaPods dependency with `pod install`.  
   This command must not have output any warning. ;)

### Troubleshooting

#### RCTView.h file not found

Because react-native is only available as npm module (and not as "regular" CocoaPods
dependency, see RN [v0.13 release notes](https://github.com/facebook/react-native/releases/tag/v0.13.0) for more informations), it is required that you import react-native also from a local path. Ensure that you include at least this RN dependencies before you include `react-native-mapbox-gl` in your `Podfile`. Here is a complete working example if you want add your Podfile in the project root while your generated Xcode project is still in the `ios` folder:

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

pod 'RCTMapboxGL', :path => 'node_modules/react-native-mapbox-gl/ios'
```

#### NativeModules.MapboxGLManager.* not defined

Verify that your "Build Settings" parameter "Other linker flags" (`OTHER_LDFLAGS`)
is defined correctly. This is NOT the case in a `react-native init` project which doesn't
use CocoaPods. See Step 3 above!

## Manually

1. `npm install react-native-mapbox-gl --save`
1. In the XCode's `Project navigator`, right click on project's name ➜ `Add Files to <...>` ![](https://cldup.com/k0oJwOUKPN.png)
1. Add `node_modules/react-native-mapbox-gl/ios/RCTMapboxGL.xcodeproj` ![](https://cldup.com/bnJWwtaACM.png)
1. Select your project in the `Project navigator`. Click `Build Phases` then `Link Binary With Libraries`. Add `node_modules/react-native-mapbox-gl/ios/RCTMapboxGL/libRCTMapboxGL.a` ![](https://cldup.com/QWhL_SjobN.png)
1. Select your project in the `Project navigator`. Click `Build Phases` then `Copy Bundle Resources`. Click the `+` button. When the modal appears, click `Add other`. Add `node_modules/react-native-mapbox-gl/ios/RCTMapboxGL/Mapbox.bundle`. ![](https://cldup.com/Oi7uHxc1Fd.png)
1. Just like in the last step, select your project in the `Project navigator`. Click `Build Phases` then `Copy Bundle Resources`. Click the `+` button. When the modal appears, click `Add other`. Add `node_modules/react-native-mapbox-gl/ios/RCTMapboxGL/Settings.bundle`. [More information on location metrics can be found here](https://www.mapbox.com/mapbox-gl-ios/#metrics_opt_out).
1. Add the following Cocoa framework dependencies to your target's Link Binary With Libraries build phase:
  * `CoreTelephony.framework`
  * `GLKit.framework`
  * `ImageIO.framework`
  * `MobileCoreServices.framework`
  * `QuartzCore.framework`
  * `SystemConfiguration.framework`
  * `libc++.tbd`
  * `libsqlite3.tbd`
  * `libz.tbd`
  * ![](https://cldup.com/KuSEgMQQSy.gif)
1. Click on the `RCTMapboxGL` project. Under the `Build Settings` tab, search for `header_search_path`. Make sure `$(SRCROOT)/../../../React` and `$(SRCROOT)/../../react-native/React` are added and set to `recursive`. ![](https://cldup.com/81zUEHaKoX.png)
1. You can now `require('react-native-mapbox-gl')` and build.
