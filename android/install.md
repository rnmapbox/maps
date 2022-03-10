# Android Installation

## We're supporting 3 implementations at the moment:

  - maplibre: *DEFAULT* open source fork of older open source mapbox libraries with many improvements
  - mabpox: v10 latest mapbox implementation - not opensource requires access for download
  - mapbox-gl: classis mapbox libraries - should work but will be dropped, recent versions are not open source and requires acess for download


## Using MapLibre

[MapLibre](https://github.com/maplibre/maplibre-gl-native) is an OSS fork of MapboxGL.
This is the default, and should work without any changes in gradle files.

### Custom versions

Overwrite mapbox dependecies within your `android/build.gradle > buildscript > ext` section

```groovy
buildscript {
    ext {
        // ...
        RNMapboxMapsImpl = "maplibre" // optinal - as this is the default

        RNMapboxMapsLibs = { // optional - only required if you want to customize it
            implementation ("org.maplibre.gl:android-sdk:9.5.2")
            implementation ("org.maplibre.gl:android-sdk-turf:5.9.0")

            implementation ("org.maplibre.gl:android-plugin-localization-v9:1.0.0")
            implementation ("org.maplibre.gl:android-plugin-annotation-v9:1.0.0")
            implementation ("org.maplibre.gl:android-plugin-markerview-v9:1.0.0")
        }
    }
}
```

Feel free to check out the `/example` projects [`android/build.gradle`](https://github.com/react-native-mapbox-gl/maps/blob/master/example/android/build.gradle) for inspiration!

## Mapbox Maps SDK v10

Add `RNMapboxMapsImpl = "mapbox"` to your gradle file - see bellow for details.

### Custom versions

Overwrite mapbox dependecies within your `android/build.gradle > buildscript > ext` section


```groovy
buildscript {
    ext {
        // ...
        RNMapboxMapsImpl = "mapbox" // required for v10

        RNMapboxMapsLibs = { // optional - only required if you want to customize it
            implementation 'com.mapbox.maps:android:10.3.0'
            implementation 'com.mapbox.mapboxsdk:mapbox-sdk-turf:5.4.1'
        }
    }
}
```

## Mapbox Maps GL Native SDK (pre v10)


### Custom versions

We've set up default Mapbox dependencies for you.  
Feel free to check em out [here](https://github.com/rnmapbox/maps/blob/eca4858744cab134b06ae455bcdacc63233318a5/android/rctmgl/build.gradle#L55-L76)

However, it is also possible to set a custom version of the [Mapbox SDK](https://github.com/mapbox/mapbox-gl-native-android)  
Which will overwrite our defaults.

Add something like the following to your `android/build.gradle > buildscript > ext` section:

```groovy
// android/build.gradle

buildscript {
    // ... stuff
    ext {
        RNMapboxMapsImpl = "mapbox-gl"

        // ... stuff
        RNMapboxMapsLibs = {
            implementation 'com.mapbox.mapboxsdk:mapbox-android-sdk:9.7.1'
            implementation 'com.mapbox.mapboxsdk:mapbox-sdk-services:5.8.0'
            implementation 'com.mapbox.mapboxsdk:mapbox-sdk-turf:5.8.0'
            implementation 'com.mapbox.mapboxsdk:mapbox-android-gestures:0.7.0'

            implementation 'com.mapbox.mapboxsdk:mapbox-android-plugin-annotation-v9:0.8.0'
            implementation 'com.mapbox.mapboxsdk:mapbox-android-plugin-localization-v9:0.14.0'
            implementation 'com.mapbox.mapboxsdk:mapbox-android-plugin-markerview-v9:0.4.0'
        }
    // ... more stuff?
    }
}
```

NOTICE, If you are using newer versions of the SDK, you will need to authorize your download of the Maps SDK via a secret access token with the `DOWNLOADS:READ` scope.  
This [guide](https://docs.mapbox.com/android/maps/guides/install/#configure-credentials) explains how to `Configure credentials` and `Configure your secret token`.

Then under section `allprojects/repositories` add your data:

```groovy
// android/build.gradle

allprojects {
    repositories {
        // ...other repos
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
        // ...even more repos?
    }
}
```

Feel free to check out the `/example` projects [`android/build.gradle`](https://github.com/rnmapbox/maps/blob/main/example/android/build.gradle) for inspiration!

<br>

---

<br>



