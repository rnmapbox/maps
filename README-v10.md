# Getting Started

## Both Platforms

1. Set up a project:

```sh
react-native init sample --version 0.69.7
cd sample
yarn add https://github.com/rnmapbox/maps#main --save
```

## iOS

1. Open `./ios/Podfile` and add the following:

```diff
+  $RNMapboxMapsImpl = 'mapbox'

  platform :ios, '13.0'

  ...

+  pre_install do |installer|
+    $RNMapboxMaps.pre_install(installer)
+  end

  ...

+  post_install do |installer|
+    react_native_post_install(installer)
+    $RNMapboxMaps.post_install(installer)
+  end
```

2. Add `$(SDKROOT)/usr/lib/swift` to Library Search Paths.

3. On React Native 0.60 only, add:

```diff
+ pod 'React-Core', :path => '../node_modules/react-native/React', modular_headers: true
```

## Android

1. Open or create a file called `./android/local.properties` and add (with your actual SDK token):

```diff
+ mapbox.sdk.token=<YOUR SDK TOKEN>
```

2. Open `./android/build.gradle` and make the following modifications:

```diff
+ def localProperties = new Properties()
+ localProperties.load(project.rootProject.file("local.properties").newDataInputStream())

buildscript {
    ext {
      ...
+      RNMapboxMapsImpl = 'mapbox'
    }
}

allprojects {
    ...
    repositories {
        ...
+        maven {
+            url 'https://api.mapbox.com/downloads/v2/releases/maven'
+            authentication {
+                basic(BasicAuthentication)
+            }
+            credentials {
+                username = 'mapbox' // Should always be 'mapbox' (not your username). 
+                password = localProperties.getProperty('mapbox.sdk.token')
+            }
+        }
    }
}
```

3. Open `./android/app/build.gradle` and add the following:

```diff
android {
+    packagingOptions {
+        pickFirst 'lib/x86/libc++_shared.so'
+        pickFirst 'lib/x86_64/libc++_shared.so'
+        pickFirst 'lib/arm64-v8a/libc++_shared.so'
+        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
+    }
}
```