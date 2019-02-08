Hey all - one more update from our side, thanks as always for your continued patience and support. We’ve thought a lot about the best way in which to continue supporting this project and community going forward and have decided it’s in the best interest of both to transition this project to be a community-driven project led by its original author, @nitaliano. This year the Mapbox mobile engineering team is focused on some large (and exciting!) new features in our native Android and iOS SDKs and we believe this decision brings the best path forward to guarantee this project continues being actively developed.

What this means in practical terms:

* We’re looking for contributors! If you and your company depend on this project and would like to join the initiative, please reach out to @nitaliano  and share more about your plans.
* We’re moving this repo under @nitaliano’s account but nothing else changes: we’ll keep the git history, issue tracker, and code open source as it is today.
* @nitaliano has been hard at work smoothing out the current v7 branch and you should expect a pre-release being pushed out in a couple of weeks.
* Mapbox remains committed to prioritizing and fixing Android or iOS native issues on our Maps SDK that this community surfaces. Please keep opening issues on https://github.com/mapbox/mapbox-gl-native and tagging @zugaldia for visibility.

We’re grateful to all of you for making this project a vibrant community, we’re excited to see what this community builds next.

# Mapbox Maps SDK for React Native

_An unofficial React Native component for building maps with the [Mapbox Maps SDK for iOS](https://www.mapbox.com/ios-sdk/) and [Mapbox Maps SDK for Android](https://www.mapbox.com/android-sdk/)_

[![npm version](https://badge.fury.io/js/%40mapbox%2Freact-native-mapbox-gl.svg)](https://badge.fury.io/js/%40mapbox%2Freact-native-mapbox-gl)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Freact-native-mapbox-gl.svg?type=shield)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Freact-native-mapbox-gl?ref=badge_shield)

## What is Mapbox?

Mapbox is the location data platform for mobile and web applications. We provide [building blocks](https://www.mapbox.com/products/) to add location features like maps, search, and navigation into any experience you create. Use our simple and powerful APIs & SDKs and our open source libraries for interactivity and control.

## Sign up for Mapbox

Not a Mapbox user yet? [Sign up for an account here](https://www.mapbox.com/signup/). Once you’re signed in, all you need to start building is a Mapbox access token. Use this same short code with all of our interactive mapping libraries, Python and JavaScript SDKs, and directly against our REST APIs. You can create and manage your access tokens on your [Mapbox Account page](https://www.mapbox.com/account/).


## Installation

**Dependencies**

* [node](https://nodejs.org)
* [npm](https://www.npmjs.com/)
* [React Native](https://facebook.github.io/react-native/) recommended version 0.50 or greater

**Git**
```
git clone git@github.com:mapbox/react-native-mapbox-gl.git
cd react-native-mapbox-gl
```

**Yarn**
```
yarn add @mapbox/react-native-mapbox-gl
```

**Npm**
```
npm install @mapbox/react-native-mapbox-gl --save
```

## Installation Guides

* [Android](/android/install.md)
* [iOS](/ios/install.md)
* [Example](/example)

## Documentation

### Components
* [MapView](/docs/MapView.md)
* [Light](/docs/Light.md)
* [StyleSheet](/docs/StyleSheet.md)
* [PointAnnotation](/docs/PointAnnotation.md)
* [Callout](/docs/Callout.md)

### Sources
* [VectorSource](/docs/VectorSource.md)
* [ShapeSource](/docs/ShapeSource.md)
* [RasterSource](/docs/RasterSource.md)

### Layers
* [BackgroundLayer](/docs/BackgroundLayer.md)
* [CircleLayer](/docs/CircleLayer.md)
* [FillExtrusionLayer](/docs/FillExtrusionLayer.md)
* [FillLayer](/docs/FillLayer.md)
* [LineLayer](/docs/LineLayer.md)
* [RasterLayer](/docs/RasterLayer.md)
* [SymbolLayer](/docs/SymbolLayer.md)

### Offline
* [OfflineManager](/docs/OfflineManager.md)
* [SnapshotManager](/docs/snapshotManager.md)

## Expo Support
We have a feature request open with Expo if you want to see it get in show your support https://expo.canny.io/feature-requests/p/add-mapbox-gl-support

## Developer Group

Have a question or need some help? Join our [Gitter developer group](https://gitter.im/react-native-mapbox-gl/Lobby)!

## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Freact-native-mapbox-gl.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Freact-native-mapbox-gl?ref=badge_large)
