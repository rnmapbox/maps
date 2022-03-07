
<p align="center">
  <a href="https://github.com/rnmapbox/maps/blob/main/example/src/examples/FillRasterLayer/ChoroplethLayerByZoomLevel.js">
    <img  src="readme_assets/example_choropleth_layer.png"  width="175"/>
  </a>
  <a href="https://github.com/rnmapbox/maps/blob/main/example/src/examples/SymbolCircleLayer/EarthQuakes.js">
    <img  src="readme_assets/example_clustering_earthquakes.png" width="175"/>
  </a>
  <a href="https://github.com/rnmapbox/maps/blob/main/example/src/examples/Annotations/CustomCallout.tsx">
    <img  src="readme_assets/example_custom_callout.png" width="175"/>
  </a>
  <a href="https://github.com/rnmapbox/maps/blob/main/example/src/examples/SymbolCircleLayer/DataDrivenCircleColors.js">
    <img  src="readme_assets/example_data_driven_circle_colors.png" width="175"/>
  </a>
  <a href="https://github.com/rnmapbox/maps/blob/main/example/src/examples/FillRasterLayer/ImageOverlay.js">
    <img  src="readme_assets/example_image_overlay.png" width="175"/>
  </a>
</p>

<br>


<a href="https://www.mapbox.com">
  <img align="right" src="/assets/mapbox_logo.png" width="200"/>
</a>

# React Native Mapbox GL Demo

Demo Application for [React Native Mapbox GL](../README.md)

*Note:* this app is using [non trivial babel/metro configs](https://github.com/rnmapbox/maps/pull/778), so we can consume the `maps` library from parent directory directly. Regular apps don't need this complicated setup.

<br>

## What is Mapbox?

[Mapbox](https://www.mapbox.com/) is the location data platform for mobile and web applications.

<br>

## Sign up for Mapbox

Not a Mapbox user yet? [Sign up for an account here](https://www.mapbox.com/signup/). Once you’re signed in, all you need to start building is a Mapbox access token. Use this same short code with all of our interactive mapping libraries, Python and JavaScript SDKs, and directly against our REST APIs. You can create and manage your access tokens on your [Mapbox Account page](https://www.mapbox.com/account/).

<br>

## Installation

* Make sure you are in the example directory
```
cd example
```
* Create a file called `accesstoken` in the root of the example project and just paste in your [Mapbox access token](https://www.mapbox.com/studio/account/tokens/). (The `accesstoken` file is processed in postinstall, so you need to run `yarn install` after adding/changing accesstoken.)

* Install our dependencies using `yarn install`.

<br>

## Start React Native Packager (or not, it starts automatically 🤷‍♀️)

Open up another tab in your Terminal and run
```
yarn start
```

*Note*: if modules were added to base lib you might need to run `yarn start --reset-cache` because we're using `babel` to [rewrite imports](https://github.com/rnmapbox/maps/pull/778)

<br>

## Run Android Emulator

* Start Android emulator
* Run `yarn android` from `example` directory

**NOTE**

If the build fails make sure gradle has permission to build from cli
```
cd android
chmod +x gradlew
```

<br>

## Run iOS Simulator

You can run this with the react-native cli or Xcode

* Run `yarn ios` from `example` directory

**NOTE**

If you run into

```
Command failed: /usr/libexec/PlistBuddy -c Print:CFBundleIdentifier build/Build/Products/Debug-iphonesimulator/RNMapboxGLExample.app/Info.plist
Print: Entry, ":CFBundleIdentifier", Does Not Exist
```

Just run the example from Xcode, it seems to be an [issue](https://github.com/facebook/react-native/issues/14423) with RN.
