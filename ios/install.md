# iOS Installation


`@rnmapbox/maps` via `npm` or `yarn`.

<br/>

Add the following to your `ios/Podfile`:



```ruby
  pre_install do |installer|
    $RNMapboxMaps.pre_install(installer)
    ... other pre install hooks
  end
```

```ruby
  post_install do |installer|
    $RNMapboxMaps.post_install(installer)
    ... other post install hooks
  end
```

<br>

You will need to authorize your download of the Maps SDK with a secret access token with the `DOWNLOADS:READ` scope. This [guide](https://docs.mapbox.com/ios/maps/guides/install/#configure-credentials) explains how to configure the secret token under section `Configure your secret token`.


Run `pod install` to download the proper mapbox dependency.

```sh
# Go to the ios folder
cd ios

# Run Pod Install
pod install
```

If you want to show the user's current location on the map with the [LocationPuck](../docs/LocationPuck.md) component, you'll need to add the following property to your `Info.plist` (see [Mapbox iOS docs](https://docs.mapbox.com/ios/maps/guides/user-location/#request-temporary-access-to-full-accuracy-location) for more info):

```
<key>NSLocationWhenInUseUsageDescription</key>
<string>Show current location on map.</string>
```

You are good to go!

Read on if you want to edit your Mapbox version or flavor.

<br/>

## Using a custom version of the Mapbox SDK

You can also override the version to use. *Warning:* if you set a version, then later update, the `rnamapbox/maps` library it's possible that you'll end up using Mapbox older version than supported. Make sure you revise this value with `@rnmapbox/maps` updates. Also note that for 11.0 or later versions you'll need to set `$RNMapboxMapsUseV11 = true`, see bellow

```ruby
# Warning: only for advanced use cases, only do this if you know what you're doing.
# $RNMapboxMapsVersion = '~> 10.16.2'
```

<br/>

## V11 support

We have support for mapbox 11.

Add the following to your Podfile:

```ruby
$RNMapboxMapsVersion = '= 11.8.0'
```

If using expo managed workflow, set the "RNMapboxMapsVersion" variable. See the [expo guide](/plugin/install.md)

## Troubleshooting

### Pod install fails on upgrade of @rnmapbox/maps with `could not find compatible versions for pod "MapboxMaps"`

Example message:
```log
[!] CocoaPods could not find compatible versions for pod "MapboxMaps":
  In snapshot (Podfile.lock):
    MapboxMaps (= 10.15.0, ~> 10.15.0)

  In Podfile:
    rnmapbox-maps (from `../node_modules/@rnmapbox/maps`) was resolved to 10.0.15, which depends on
      MapboxMaps (~> 10.16.0)
```

Please use `pod update MapboxMaps` as suggested by cocoapods


