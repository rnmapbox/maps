## Getting Started


```
react-native init sample --version 0.60.5
cd sample
yarn add git+https://git.systemlevel.com/react-native-mapbox/maps.git#main --save

code android/build.gradle 
```
# add the following:
allprojects {
    repositories {
        maven {
            url 'https://api.mapbox.com/downloads/v2/releases/maven'
            authentication {
                basic(BasicAuthentication)
            }
            credentials {
                // Do not change the username below.
                // This should always be `mapbox` (not your username). 
                username = 'mapbox'
                // Use the secret token you stored in gradle.properties as the password
                password = project.properties['MAPBOX_DOWNLOADS_TOKEN'] ?: ""
            }
        }
    }
}
```

code android/app/build.gradle
```
# add the following:
android {
    packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
    }
}
```

code android/build.gralde
```
buildscript {
    ext {
      ...
      mapboxV10 = true
    }
}
```

code ios/Podfile
# change these
```
  $RNMBGL_USE_V10 = true

  platform :ios, '13.0'

  ...

  ...

  pre_install do |installer|
    $RNMBGL.pre_install(installer)
  end
  
  post_install do |installer|
    react_native_post_install(installer)
    $RNMBGL.post_install(installer)
  end
```


# on RN 0.60 only:
# add modular_headers to `React-Core`
#  pod 'React-Core', :path => '../node_modules/react-native/React', modular_headers: true


code android/app/build.gradle
```
# add the following:
android {
    packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
    }
}
```

code android/build.gralde
```
buildscript {
    ext {
      ...
      mapboxV10 = true
    }
}
```

code ios/Podfile
# change these
```
  $USE_V10 = true

  platform :ios, '13.0'

  ...

  ...

  pre_install do |installer|
    $RNMBGL.pre_install(installer)
  end
  
  post_install do |installer|
    react_native_post_install(installer)
    $RNMBGL.post_install(installer)
  end
```


# on RN 0.60 only:
# add modular_headers to `React-Core`
#  pod 'React-Core', :path => '../node_modules/react-native/React', modular_headers: true


npx react-native run-android
```

IOS:

 * Add $(SDKROOT)/usr/lib/swift to Libary search paths.

## Progress




# Progress:

## MapView
- [ ] Add stuff below user location on android
- [ ] iOS: update zoomLevel on prop changes
- [ ] onDidFinishLoadingMap: 
- [ ] WillStartLoadingMap, DidFailLoadingMap
- [ ] getPointInView (Get Pixel Point in MapView)
- [ ] Show and hida a layer example
- [ ] takeSnap
  - [x] ios
  - [ ] android
- [x] queryTerrainElevation (v10)
  - [x] ios
  - [x] android
## Annotations
- [x] PointAnnotation
  - [x] ios
  - [x] android
  - [x] Callout
     - [x] ios
     - [x] android 
- [x] MarkerView
  - [x] ios
  - [x] android


## UserLocation
- [x] User location
  - [x] ios
  - [x] android

## Camera
- [x] Basic camera

## MapView
- [ ] Add stuff below user location on android
- [ ] iOS: update zoomLevel on prop changes
- [ ] onDidFinishLoadingMap: 
- [ ] WillStartLoadingMap, DidFailLoadingMap
- [ ] getPointInView (Get Pixel Point in MapView)
- [ ] Show and hida a layer example
- [ ] takeSnap
  - [x] ios
  - [ ] android
- [x] queryTerrainElevation (v10)
  - [x] ios
  - [x] android
## Annotations
- [x] PointAnnotation
  - [x] ios
  - [x] android
  - [x] Callout
     - [x] ios
     - [x] android 
- [x] MarkerView
  - [x] ios
  - [x] android


## UserLocation
- [x] User location
  - [x] ios
  - [x] android

## Camera
- [x] Basic camera

## Sources:
- [x] VectorSource
- [x] ShapeSource: android, ios GradientLine: +1
  - [x] getCluster*
    - [x] ios
    - [x] android
  - [x] onPress
    - [x] ios
    - [x] androidp
- [x] RasterSource (WaterColorRasterTiles)
  - [x] ios
  - [x] android
- [x] RasterDemSource (NEW in v10) - ios, android
- [x] ImageSource
  - [x] ios
  - [x] android

## Layers:

 - [x] CircleLayer: ios, android
 - [x] LineLayer: ios, android 
 - [x] FillLayer: ios, android - YoYo camera :+1
 - [x] RasterLayer:
   - [x] ios
   - [x] android
 - [x] SymbolLayer, android/ios cluster example
   - [x] Images: andorid, ios
- [x] SkyLayer (NEW in v10), ios, android

- [x] Terrain (NEW in v10), ios, android
- [x] Light
  - [x] ios
  - [x] android
- [x] LocationLayer
   - [x] ios
   - [x] android (only basic mode)
     - [x] normal
     - [x] pulse
     - [x] tint color
- [x] Heatmap
  - [x] ios
  - [x] android
- [x] Background
  - [x] ios
  - [x] android
- [x] FillExtrusion
  - [x] ios
  - [x] android
- [ ] Heatmap
  - [x] ios
  - [x] android

# Offline

- [x] OfflineManager
  - [x] ios
  - [x] android
- [x] Progress, Error listeners
  - [x] ios
  - [x] android

# Snapshot

- [ ] Snapshot
  - [x] ios
  - [ ] android
  - [x] Images: andorid, ios

- [ ] Terrain, ios only
