<a href="https://www.mapbox.com">
  <img src="/assets/mapbox_logo.png" width="500"/>
</a>

# React Native Mapbox GL Demo

Demo Application for [React Native Mapbox GL](../README.md)

## What is Mapbox?

Mapbox is the location data platform for mobile and web applications. We provide [building blocks](https://www.mapbox.com/products/) to add location features like maps, search, and navigation into any experience you create. Use our simple and powerful APIs & SDKs and our open source libraries for interactivity and control.

## Sign up for Mapbox

Not a Mapbox user yet? [Sign up for an account here](https://www.mapbox.com/signup/). Once you’re signed in, all you need to start building is a Mapbox access token. Use this same short code with all of our interactive mapping libraries, Python and JavaScript SDKs, and directly against our REST APIs. You can create and manage your access tokens on your [Mapbox Account page](https://www.mapbox.com/account/).

## Installation

* Make sure you are in the example directory
```
cd example
```
* Create a file called `accesstoken` in the root of the example project and just paste in your [Mapbox access token](https://www.mapbox.com/studio/account/tokens/). (The `accesstoken` file is processed in postinstall, so you need to run `npm install` after adding/changing accesstoken.)

* Install our dependencies using `npm install`.
## Start React Native Packager

Open up another tab in your Terminal and run
```
npm start
```

## Run Android Simulator

* Start Android emulator
* Run `adb reverse tcp:8081 tcp:8081` to forward port to packager(needed for hot reloading, if you're not developing you can skip this step).
* Run `react-native run-android` from `example` directory


**NOTE**

If the build fails make sure gradle has permission to build from cli
```
cd android
chmod +x gradlew
```

## Run iOS Simulator

You can run this with the react-native cli or Xcode

* Run `cd ios && pod install && cd ..` from `example` directory to install cocoapods pods
* Run `react-native run-ios` from `example` directory

**NOTE**

If you run into

```
Command failed: /usr/libexec/PlistBuddy -c Print:CFBundleIdentifier build/Build/Products/Debug-iphonesimulator/RNMapboxGLExample.app/Info.plist
Print: Entry, ":CFBundleIdentifier", Does Not Exist
```

Just run the example from Xcode, it seems to be an [issue](https://github.com/facebook/react-native/issues/14423) with RN.
