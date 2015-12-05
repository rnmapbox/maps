# Installation Process

## Use CocoaPods

If you already use [CocoaPods](https://cocoapods.org/) in your react-native project you add the native
part of Mapbox GL with just one line of code:

1. `npm install react-native-mapbox-gl --save`
1. Add `pod 'RCTMapboxGL', :path => '../node_modules/react-native-mapbox-gl/ios'` to your `Podfile` file and re-run `pod install`.

See also the react-native [0.13 release notes](https://github.com/facebook/react-native/releases/tag/v0.13.0)

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
