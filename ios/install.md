# Manual Installation Process

1. `npm install react-native-mapbox-gl --save`
2. In the XCode's `Project navigator`, right click on project's name ➜ `Add Files to <...>` ![](https://cldup.com/k0oJwOUKPN.png)
3. Add `node_modules/react-native-mapbox-gl/ios/RCTMapboxGL.xcodeproj` ![](https://cldup.com/bnJWwtaACM.png)
4. Select your project in the `Project navigator`. Click `Build Phases` then `Link Binary With Libraries`. Add `node_modules/react-native-mapbox-gl/ios/RCTMapboxGL/libRCTMapboxGL.a` ![](https://cldup.com/QWhL_SjobN.png)
5. Select your project in the `Project navigator`. Click `Build Phases` then `Copy Bundle Resources`. Click the `+` button. When the modal appears, click `Add other`. Add `node_modules/react-native-mapbox-gl/ios/RCTMapboxGL/Mapbox.bundle`. ![](https://cldup.com/Oi7uHxc1Fd.png)
6. Just like in the last step, select your project in the `Project navigator`. Click `Build Phases` then `Copy Bundle Resources`. Click the `+` button. When the modal appears, click `Add other`. Add `node_modules/react-native-mapbox-gl/ios/RCTMapboxGL/Settings.bundle`. [More information on location metrics can be found here](https://www.mapbox.com/mapbox-gl-ios/#metrics_opt_out).
7. Add the following Cocoa framework dependencies to your target's Link Binary With Libraries build phase:
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
8. Click on the `RCTMapboxGL` project. Under the `Build Settings` tab, search for `header_search_path`. Make sure `$(SRCROOT)/../../../React` and `$(SRCROOT)/../../react-native/React` are added and set to `recursive`. ![](https://cldup.com/81zUEHaKoX.png)
9. You can now `require('react-native-mapbox-gl')` and build.
