## UNRELEASED

```
Please add unreleased changes in the following style:
PR Title ([#123](link to my pr))

Update ShapeSource methods to make it usable with any cluster ( Use cluster itself instead of cluster_id as first argument for getClusterExpansionZoom/getClusterLeaves/getClusterChildren methods. Version < 9 methods still supports passing cluster_id as a first argument but a deprecation warning will be shown. ) ([#1499](https://github.com/react-native-mapbox-gl/maps/pull/1499))
```

feat(camera): Enable `padding` as a root-level prop on the camera, with `bounds.padding*` as fallbacks ([#1538](https://github.com/react-native-mapbox-gl/maps/pull/1538/files))
feat(example): update vertical alignment example ([#1579](https://github.com/react-native-mapbox-gl/maps/pull/1550))  
build(android): add telemetry dependency to default build setup ([#1550](https://github.com/react-native-mapbox-gl/maps/pull/1550))  
fix: revert pinned mapLibre version to `5.11.0` ([8a2b00e67ba6398f3f6e6f52e98b0f0cea437e4d](https://github.com/react-native-mapbox-gl/maps/commit/8a2b00e67ba6398f3f6e6f52e98b0f0cea437e4d))

style(eslint): align root and example with the same configuration ([#1575](https://github.com/react-native-mapbox-gl/maps/pull/1575))

---

## 8.3.0

Fix TypeScript type for Callout's textStyle prop ([#1450](https://github.com/react-native-mapbox-gl/maps/pull/1450))  
Build(ios): pin maplibre version to 5.12.0 ([#1454](https://github.com/react-native-mapbox-gl/maps/pull/1454))  
Update geoUtils helpers types to correspond with `turf/helpers` ([#1455](https://github.com/react-native-mapbox-gl/maps/pull/1455))  
Fix crash with missing okhttp dependency ([#1452](https://github.com/react-native-mapbox-gl/maps/pull/1452))  
Move from react-native-testing-library => @testing-library/react-native ([#1453](https://github.com/react-native-mapbox-gl/maps/pull/1453))  
Feat(camera): maxBounds/(min|max)ZoomLevel can be updated dynamically ([#1462](https://github.com/react-native-mapbox-gl/maps/pull/1462))  
Refactor(example): clean up folder structure ([#1464](https://github.com/react-native-mapbox-gl/maps/pull/1464))  
Fix lineGradient showing wrong colors ([#1471](https://github.com/react-native-mapbox-gl/maps/pull/1471))  
Support tintColor on Android ([#1465](https://github.com/react-native-mapbox-gl/maps/pull/1465))  
Feat(android): dynamically update tintColor & add example ([#1469](https://github.com/react-native-mapbox-gl/maps/pull/1469)  
Examples: align install steps with yarn, ignore created env files ([#1484](https://github.com/react-native-mapbox-gl/maps/pull/1484)  
Fix(plugin): Exclude arm64 architectures for simulator builds ([#1490](https://github.com/react-native-mapbox-gl/maps/pull/1490)  
Feat(android): dynamically update tintColor & add example ([#1469](https://github.com/react-native-mapbox-gl/maps/pull/1469))  
Docs: make background in example pngs transparent ([#1483](https://github.com/react-native-mapbox-gl/maps/pull/1483))  
Style: run yarn lint ([#1486](https://github.com/react-native-mapbox-gl/maps/pull/1486))  
Test: add unit tests for component light ([#1489](https://github.com/react-native-mapbox-gl/maps/pull/1489))  
Feat: add Adds getClusterChildren method to ShapeSource ([#1495](https://github.com/react-native-mapbox-gl/maps/pull/1495))

## 8.2.1

fix issue when publishing to npm with `prepare` script

## 8.2.0

getClusterLeaves method for ShapeSource ([#1411](https://github.com/react-native-mapbox-gl/maps/pull/1411))  
Add logoPosition props to `MapView` to position the mapbox logo ([#1396](https://github.com/react-native-mapbox-gl/maps/pull/1396))  
Add compatibility with React 17/ npm7 ([#1387](https://github.com/react-native-mapbox-gl/maps/pull/1387))  
Add Expo config plugin ([#1388](https://github.com/react-native-mapbox-gl/maps/pull/1388))  
Android: Bump `okhttp` to `4.9.0` ([#1390](https://github.com/react-native-mapbox-gl/maps/pull/1390))  
Support dynamically changing local JSON in styleURL ([#1399](https://github.com/react-native-mapbox-gl/maps/pull/1399))  
Add missing types to `SymbolLayerStyle` & `ImagesProps` ([#1360](https://github.com/react-native-mapbox-gl/maps/pull/1360))  
Fix error while updating coordinates of RCTMGLImageSource ([#1310](https://github.com/react-native-mapbox-gl/maps/pull/1310))

## 8.2.0-beta2

Add types for `Logger` class ([#1316](https://github.com/react-native-mapbox-gl/maps/pull/1316))  
Enable linear easing on map camera ([#1281](https://github.com/react-native-mapbox-gl/maps/pull/1281))  
Allow MapLibre as an option ([#1311](https://github.com/react-native-mapbox-gl/maps/pull/1311))  
Fix native UserLocation on Android ([#1284](https://github.com/react-native-mapbox-gl/maps/pull/1284))  
Add getClusterExpansionZoom to ShapeSource ([#1279](https://github.com/react-native-mapbox-gl/maps/pull/1279))  
Add type definition for AnimatedPoint ([#1280](https://github.com/react-native-mapbox-gl/maps/pull/1280))

## 8.2.0-beta1

### Breaking changes:

Use `pre_install` hook to support non `use_frameworks!` usage #1262. Please add the following to your `Podfile`:

```ruby
pre_install do |installer|
  $RNMBGL.pre_install(installer)
  ...
end
```

and

```ruby
post_install do |installer|
  $RNMBGL.post_install(installer)
  ...
end
```

### Other changes:

- Add course to the location events #1209
- Fix heading indicator alignment #1215
- App crash when ProGuard is set to true #1184
- [iOS] Implemented ShapeSource.features(...) method #1140
- style json support on styleURL #1102
- Fix: onUpdate not called when renderMode is native #1135

## 8.1.0

- By default [use 5.9.0 Mapbox on iOS as 8.1.0rc8 and before](https://github.com/react-native-mapbox-gl/maps/pull/1120)
- Fix [crash during styleURL change on adroid](https://github.com/react-native-mapbox-gl/maps/pull/1119)
- Fix [warning Sending LogEvent with no listeners registered.](https://github.com/react-native-mapbox-gl/maps/pull/1108)
- Fix [race in close map and icon image download](https://github.com/react-native-mapbox-gl/maps/pull/1089)
- Fix [android padding](https://github.com/react-native-mapbox-gl/maps/pull/1087)
- Android [custom mapboxgl version](https://github.com/react-native-mapbox-gl/maps/pull/1088)
- Fix [support 6.\* of MapboxGL IOS by setting `$ReactNativeMapboxGLIOSVersion = "6.2.1"` in Podfile](https://github.com/react-native-mapbox-gl/maps/pull/1044)
- Fix [map rendered at (0,0,0,0) on iOS](https://github.com/react-native-mapbox-gl/maps/pull/1084)
- Fix [edge Padding + auto limit padding on iOS](https://github.com/react-native-mapbox-gl/maps/pull/1057)
- Fix [coordinate 0,0 was considered invalid on IOS](https://github.com/react-native-mapbox-gl/maps/pull/1076)
- Fix [refresh on PointAnnotation on Android](https://github.com/react-native-mapbox-gl/maps/pull/1062)
- Fix [Image source coordinates update on the fly](https://github.com/react-native-mapbox-gl/maps/pull/1036/files)
- Upgrade to [ios 5.9.0](https://github.com/mapbox/mapbox-gl-native-ios/releases/tag/ios-v5.9.0)
- Upgrade to [android 9.1.0](https://github.com/mapbox/mapbox-gl-native-android/releases/tag/android-v9.1.0)
- Set default Mapbox logging verbosity to warning. (Change it using Logger.setLogLevel('verbose'))
- Error/Warn mapbox log messages are treated as redbox/yellowbox errors/warnings. (Override it using Logger.setLoggerCallback(log => { return true })
- Native user location [#825](https://github.com/react-native-mapbox-gl/maps/pull/825)

## 8.1.0-rc11

- By default [use 5.9.0 Mapbox on iOS as 8.1.0rc8 and before](https://github.com/react-native-mapbox-gl/maps/pull/1120)
- Fix [crash during styleURL change on adroid](https://github.com/react-native-mapbox-gl/maps/pull/1119)
- Fix [warning Sending LogEvent with no listeners registered.](https://github.com/react-native-mapbox-gl/maps/pull/1108)
- Fix [race in close map and icon image download](https://github.com/react-native-mapbox-gl/maps/pull/1089)
- Fix [android padding](https://github.com/react-native-mapbox-gl/maps/pull/1087)
- Android [custom mapboxgl version](https://github.com/react-native-mapbox-gl/maps/pull/1088)
- Fix [support 6.\* of MapboxGL IOS by setting `$ReactNativeMapboxGLIOSVersion = "6.2.1"` in Podfile](https://github.com/react-native-mapbox-gl/maps/pull/1044)
- Fix [map rendered at (0,0,0,0) on iOS](https://github.com/react-native-mapbox-gl/maps/pull/1084)
- Fix [edge Padding + auto limit padding on iOS](https://github.com/react-native-mapbox-gl/maps/pull/1057)
- Fix [coordinate 0,0 was considered invalid on IOS](https://github.com/react-native-mapbox-gl/maps/pull/1076)
- Fix [refresh on PointAnnotation on Android](https://github.com/react-native-mapbox-gl/maps/pull/1062)
- Fix [Image source coordinates update on the fly](https://github.com/react-native-mapbox-gl/maps/pull/1036/files)
- Upgrade to [ios 5.9.0](https://github.com/mapbox/mapbox-gl-native-ios/releases/tag/ios-v5.9.0)
- Upgrade to [android 9.1.0](https://github.com/mapbox/mapbox-gl-native-android/releases/tag/android-v9.1.0)
- Set default Mapbox logging verbosity to warning. (Change it using Logger.setLogLevel('verbose'))
- Error/Warn mapbox log messages are treated as redbox/yellowbox errors/warnings. (Override it using Logger.setLoggerCallback(log => { return true })
- Native user location [#825](https://github.com/react-native-mapbox-gl/maps/pull/825)

## 8.1.0-rc10

- By default [use 5.9.0 Mapbox on iOS as 8.1.0rc8 and before](https://github.com/react-native-mapbox-gl/maps/pull/1120)
- Fix [crash during styleURL change on adroid](https://github.com/react-native-mapbox-gl/maps/pull/1119)
- Fix [warning Sending LogEvent with no listeners registered.](https://github.com/react-native-mapbox-gl/maps/pull/1108)
- Fix [race in close map and icon image download](https://github.com/react-native-mapbox-gl/maps/pull/1089)
- Fix [android padding](https://github.com/react-native-mapbox-gl/maps/pull/1087)
- Android [custom mapboxgl version](https://github.com/react-native-mapbox-gl/maps/pull/1088)
- Fix [support 6.\* of MapboxGL IOS by setting `$ReactNativeMapboxGLIOSVersion = "6.2.1"` in Podfile](https://github.com/react-native-mapbox-gl/maps/pull/1044)
- Fix [map rendered at (0,0,0,0) on iOS](https://github.com/react-native-mapbox-gl/maps/pull/1084)
- Fix [edge Padding + auto limit padding on iOS](https://github.com/react-native-mapbox-gl/maps/pull/1057)
- Fix [coordinate 0,0 was considered invalid on IOS](https://github.com/react-native-mapbox-gl/maps/pull/1076)
- Fix [refresh on PointAnnotation on Android](https://github.com/react-native-mapbox-gl/maps/pull/1062)
- Fix [Image source coordinates update on the fly](https://github.com/react-native-mapbox-gl/maps/pull/1036/files)
- Upgrade to [ios 5.9.0](https://github.com/mapbox/mapbox-gl-native-ios/releases/tag/ios-v5.9.0)
- Upgrade to [android 9.1.0](https://github.com/mapbox/mapbox-gl-native-android/releases/tag/android-v9.1.0)
- Set default Mapbox logging verbosity to warning. (Change it using Logger.setLogLevel('verbose'))
- Error/Warn mapbox log messages are treated as redbox/yellowbox errors/warnings. (Override it using Logger.setLoggerCallback(log => { return true })
- Native user location [#825](https://github.com/react-native-mapbox-gl/maps/pull/825)

## 8.1.0.rc10

- By default [use 5.9.0 Mapbox on iOS as 8.1.0rc8 and before](https://github.com/react-native-mapbox-gl/maps/pull/1120)
- Fix [crash during styleURL change on adroid](https://github.com/react-native-mapbox-gl/maps/pull/1119)
- Fix [warning Sending LogEvent with no listeners registered.](https://github.com/react-native-mapbox-gl/maps/pull/1108)

## 8.1.0.rc9

- Fix [race in close map and icon image download](https://github.com/react-native-mapbox-gl/maps/pull/1089)

## 8.1.0.rc8

- Fix [android padding](https://github.com/react-native-mapbox-gl/maps/pull/1087)
- Android [custome mapboxgl version](https://github.com/react-native-mapbox-gl/maps/pull/1088)

## 8.1.0.rc7

- Fix [map rendered at (0,0,0,0) on iOS](https://github.com/react-native-mapbox-gl/maps/pull/1084)

## 8.1.0.rc6

- Fix [edge Padding + auto limit padding on iOS](https://github.com/react-native-mapbox-gl/maps/pull/1057)
- Fix [coordinate 0,0 was considered invalid on IOS](https://github.com/react-native-mapbox-gl/maps/pull/1076)
- Fix [refresh on PointAnnotation on Android](https://github.com/react-native-mapbox-gl/maps/pull/1062)

## 8.1.0.rc5

- Fix [support 6.\* of MapboxGL IOS by setting `$ReactNativeMapboxGLIOSVersion = "6.2.1"` in Podfile](https://github.com/react-native-mapbox-gl/maps/pull/1044)
- Fix [Image source coordinates update on the fly](https://github.com/react-native-mapbox-gl/maps/pull/1036/files)

## 8.1.0.rc4

## 8.1.0.rc3

- Fix [android crashes](https://github.com/react-native-mapbox-gl/maps/pull/963)
- Fix [android padding addition](https://github.com/react-native-mapbox-gl/maps/pull/973)
- Fix [iOS interface for getAccessToken() on Android](https://github.com/react-native-mapbox-gl/maps/pull/954)

## 8.1.0.rc2

- Fix [camera padding on android](https://github.com/react-native-mapbox-gl/maps/pull/941)
- Allow [zPosition on iOS](https://github.com/react-native-mapbox-gl/maps/pull/942) in PointAnnotation child views.
- Added [InvalidatePack](https://github.com/react-native-mapbox-gl/maps/pull/929)
- Allow to [customize iOS framework version used](https://github.com/react-native-mapbox-gl/maps/pull/940)

## 8.1.0.rc1

- Added [invalidateAmbientCache](https://github.com/react-native-mapbox-gl/maps/pull/899)
- Implemented [ShapeSource#features](https://github.com/react-native-mapbox-gl/maps/pull/911)

## 8.1.0.beta

- Upgrade to [ios 5.8.0](https://github.com/mapbox/mapbox-gl-native-ios/releases/tag/ios-v5.8.0)
- Upgrade to [android 9.1.0](https://github.com/mapbox/mapbox-gl-native-android/releases/tag/android-v9.1.0)
- Set default Mapbox logging verbosity to warning. (Change it using Logger.setLogLevel('verbose'))
- Error/Warn mapbox log messages are treated as redbox/yellowbox errors/warnings. (Override it using Logger.setLoggerCallback(log => { return true })
- Native user location [#825](https://github.com/react-native-mapbox-gl/maps/pull/825)

## 8.0.0

### Breaking changes - [#610](https://github.com/react-native-mapbox-gl/maps/issues/610)

- iOS mapbox libraries updated to [5.7.0](https://github.com/mapbox/mapbox-gl-native-ios/releases/tag/ios-v5.7.0) android libraries updated to [9.0.0](https://github.com/mapbox/mapbox-gl-native-android/releases/tag/android-v9.0.0)
- ShapeSource#images is now removed (deprecated in 7.\*), use Images#images instead. Also special `assets` inside `images` is now deprecated, use `nativeAssetImages` istead.
- iOS now defaults to non `use_frameworks!`, if you want to continue to use `use_frameworks!` please see our iOS installation guidelines
- [Images#onImagesMissing](docs/Images.md)
- Android code migrated to AndroidX, RN 60.0+ is recommended.
- geoUtils is now private, please use [turf-js](https://turfjs.org/) instead
- VectorSource/SymbolSource#onPress sends ({features, point, coordinates}) instead of single feature in `event.nativeEvent.payload`. [PR#700](https://github.com/react-native-mapbox-gl/maps/pull/700)

### Changes:

- added [MarkerView](docs/MarkerView.md)
- added AnimatedShape and AnimatedCoordinatesArray [PR#702](https://github.com/react-native-mapbox-gl/maps/pull/702)

## 7.2.0

- Upstream changes in Mapbox iOS SDK 5.6.0 has made installing the SDK as an embedded framework difficult. We have therefore discontinued supporting manual installations. To update, follow the iOS installation instructions using cocoapods.

## 7.0.0

### Breaking changes:

- iOS mapbox libraries updated to [5.5.0](https://github.com/mapbox/mapbox-gl-native/releases/tag/ios-v5.3.2) android libraries updated to [8.2.1](https://github.com/mapbox/mapbox-gl-native/releases/tag/android-v8.2.1)
- `StyleSheet.create` removed.
  Mapbox styles are now just a map no need for `StyleSheet.create`.
  `StylesSheet.identity` also removed, use expressions array instead:

  ```jsx
  mapboxStyle=MapboxGL.Stylesheet.create({..., fillColor: MapboxGL.Stylesheet.identity('color') ...})
  ...
  <MapView
    ...
    <FillLayer style={mapboxStyle}... />
  </MapView>
  ```

  is now:

  ```jsx
  mapboxStyle={..., fillColor: ['get', 'color'] ...}
  ...
  <MapView
    ...
    <FillLayer style={mapboxStyle}... />
  </MapView>
  ```

  See [docs/StyleSheet.md](docs/StyleSheet.md) for more examples

- `isTelemetryEnabled` removed (as no longer supported on android) [#1](https://github.com/mfazekas/maps/pull/1)
- MapView#flyTo, MapView#bitBounds, MapView#flyTo, MapView#moveTo, MapView#zoomTo, MapView#setCamera moved to Camera. There is also experimantal properties, to replace those. See [docs/Camera.md](docs/Camera.md)
- Camera related properties on `MapView` now have to be specified on a camera object:

  ```jsx
  <MapView
     zoomLevel={8}
     centerCoordinate={[-111.8678, 40.2866]}
     ...
  >
     ...
  </MapView>
  ```

  is now:

  ```jsx
  <MapView
    ...
  >
    <Camera
       zoomLevel={8}
       centerCoordinate={[-111.8678, 40.2866]}
    />
  </MapView>
  ```

  See [docs/Camera.md](docs/Camera.md) for more examples

- User tracking properties moved from `MapView` to `Camera`

  ```jsx
  <MapView
     userTrackingMode={UserTrackingModes.Follow}
     ...
  >
     ...
  </MapView>
  ```

  is now:

  ```jsx
  <MapView
    ...
  >
    <Camera
       followUserLocation=true
       followUserMode="normal"
    />
  </MapView>
  ```

  The following properties were changed:

  - MapView#userTrackingMode is now Camera#followUserMode and Camera#followUserLocation
  - followUserMode is now a string with ('normal','compass','course'), and UserTrackingModes enum is deprecated
  - MapView#onUserTrackingModeChange is now Camera#onUserTrackingModeChange and payload contains followUserMode and followUserLocation.

- ShapeSource#images was depreacted, use Images#images instead.

  ```jsx
  <MapView
    ...
  >
    ...
    <Images images={{pin, dot}} />
    ...
    <ShapeSource ... >
       <SymbolLayer ...>
    </ShapeSource>
  </MapView>
  ```

- TODO document all changes
