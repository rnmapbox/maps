# Installation Process

Notes:
* `react-native ^v0.4.3` is required

1. `npm install react-native-mapbox-gl --save`
2. In the XCode's `Project navigator`, right click on project's name ➜ `Add Files to <...>` ![](https://cldup.com/k0oJwOUKPN.png)
3. Add `node_modules/react-native-mapbox-gl/RCTMapboxGL.xcodeproj` ![](https://cldup.com/bnJWwtaACM.png)
4. Select your project in the `Project navigator`. Click `Build Phases` then `Link Binary With Libraries`. Add `node_modules/react-native-mapbox-gl/RCTMapboxGL/libRCTMapboxGL.a` ![](https://cldup.com/QWhL_SjobN.png)
5. Select your project in the `Project navigator`. Click `Build Phases` then `Copy Bundle Resources`. Click the `+` button. When the modal appears, click `Add other`. Add `node_modules/react-native-mapbox-gl/RCTMapboxGL/MapboxGL.bundle`. ![](https://cldup.com/Oi7uHxc1Fd.png)
6. Add the following Cocoa framework dependencies to your target's Link Binary With Libraries build phase:
  * `CoreTelephony.framework`
  * `GLKit.framework`
  * `ImageIO.framework`
  * `MobileCoreServices.framework`
  * `QuartzCore.framework`
  * `SystemConfiguration.framework`
  * `libc++.dylib`
  * `libsqlite3.dylib`
  * `libz.dylib`
  * ![](https://cldup.com/KuSEgMQQSy.gif)
7. Click on the `RCTMapboxGL` project. Under the `Build Settings` tab, search for `header_search_path`. Make sure `$(SRCROOT)/../../React` and `$(SRCROOT)/../react-native/React` are added and set to `recursive`. ![](https://cldup.com/81zUEHaKoX.png)
8. You can now `require(react-native-mapbox-gl)` and build.
