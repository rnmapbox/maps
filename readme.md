<a href="https://www.mapbox.com">
  <img src="/assets/mapbox_logo.png" width="500"/>
</a>

# React Native Mapbox GL

_An experimental React Native component for building maps with the [Mapbox iOS SDK](https://www.mapbox.com/ios-sdk/) and [Mapbox Android SDK](https://www.mapbox.com/android-sdk/)_

[![npm version](https://badge.fury.io/js/react-native-mapbox-gl.svg)](https://badge.fury.io/js/react-native-mapbox-gl) [![Circle CI](https://circleci.com/gh/mapbox/react-native-mapbox-gl/tree/master.svg?style=svg)](https://circleci.com/gh/mapbox/react-native-mapbox-gl/tree/master)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Freact-native-mapbox-gl.svg?type=shield)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Freact-native-mapbox-gl?ref=badge_shield)

## What is Mapbox?

Mapbox is the location data platform for mobile and web applications. We provide [building blocks](https://www.mapbox.com/products/) to add location features like maps, search, and navigation into any experience you create. Use our simple and powerful APIs & SDKs and our open source libraries for interactivity and control.

## Sign up for Mapbox

Not a Mapbox user yet? [Sign up for an account here](https://www.mapbox.com/signup/). Once you’re signed in, all you need to start building is a Mapbox access token. Use this same short code with all of our interactive mapping libraries, Python and JavaScript SDKs, and directly against our REST APIs. You can [create and manage your access tokens in Mapbox Studio](https://www.mapbox.com/studio/account/tokens/).

## Support

This project is **experimental**. Mapbox does not officially support React Native Mapbox GL to the same extent as the [iOS](https://www.mapbox.com/ios-sdk/) or [Android](https://www.mapbox.com/android-sdk/) SDKs it depends on. Bug reports and pull requests are very welcome.

## Future Official Support
Moving forward a `v6` branch has been created and a rewrite of the library is underway.  This will move the repo out of an experimental state into a stable officially supported state. I've created a Github project called `6.0.0` right now it just has high level tasks, but I plan to break them up into smaller tasks moving forward. Once the base of `v6` is in a good state feature branches will be created off `v6` and PRs will be made against it. If you would like to be involved with the rewrite in any way just let me know! I also created a [gitter channel](https://gitter.im/react-native-mapbox-gl/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link) as a place to ask any questions at all about the repo.

## Installation

**Dependencies**

* node
* npm
* [React Native](https://facebook.github.io/react-native/) >= 0.19.0

```
npm install react-native-mapbox-gl --save
```

* [Android](/android/install.md)
* [iOS](/ios/install.md) (manually),
  or with [CocoaPods](/ios/install-cocoapods.md)

## API
* [API Documentation](/API.md)

## Example
* [See example](/example.js)

![](http://i.imgur.com/I8XkXcS.jpg)
![](https://cldup.com/A8S_7rLg1L.png)

## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Freact-native-mapbox-gl.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Freact-native-mapbox-gl?ref=badge_large)
