# Android Installation

## React-Native > `0.60.0`

If you are using autolinking feature introduced in React-Native `0.60.0` you do not need any additional steps.

<br>

---

<br>

## Mapbox Maps SDK (pre v10)

We've set up default Mapbox dependencies for you.  
Feel free to check em out [here](https://github.com/react-native-mapbox-gl/maps/blob/eca4858744cab134b06ae455bcdacc63233318a5/android/rctmgl/build.gradle#L55-L76)

However, it is also possible to set a custom version of the [Mapbox SDK](https://github.com/mapbox/mapbox-gl-native-android)  
Which will overwrite our defaults.

Add something like the following to your `android/build.gradle > buildscript > ext` section:

```groovy
// android/build.gradle

buildscript {
    // ... stuff
    ext {
        // ... stuff
        rnmbglMapboxLibs = {
            implementation 'com.mapbox.mapboxsdk:mapbox-android-sdk:9.7.1'
            implementation 'com.mapbox.mapboxsdk:mapbox-sdk-services:5.8.0'
            implementation 'com.mapbox.mapboxsdk:mapbox-sdk-turf:5.8.0'
            implementation 'com.mapbox.mapboxsdk:mapbox-android-gestures:0.7.0'
        }

        rnmbglMapboxPlugins = {
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

Feel free to check out the `/example` projects [`android/build.gradle`](https://github.com/react-native-mapbox-gl/maps/blob/master/example/android/build.gradle) for inspiration!

<br>

---

<br>

## Using MapLibre

[MapLibre](https://github.com/maplibre/maplibre-gl-native) is an OSS fork of MapboxGL

Overwrite mapbox dependecies within your `android/build.gradle > buildscript > ext` section

```groovy
buildscript {
    ext {
        // ...

        rnmbglMapboxLibs = {
            implementation ("org.maplibre.gl:android-sdk:9.2.1")
            implementation ("com.mapbox.mapboxsdk:mapbox-sdk-turf:5.3.0")
        }

        rnmbglMapboxPlugins = {
            implementation ("com.mapbox.mapboxsdk:mapbox-android-gestures:0.7.0")
            implementation ("com.mapbox.mapboxsdk:mapbox-android-plugin-localization-v9:0.12.0")    {
                exclude group: 'com.mapbox.mapboxsdk', module: 'mapbox-android-sdk'
            }
            implementation ("com.mapbox.mapboxsdk:mapbox-android-plugin-annotation-v9:0.8.0")        {
                exclude group: 'com.mapbox.mapboxsdk', module: 'mapbox-android-sdk'
            }
            implementation ("com.mapbox.mapboxsdk:mapbox-android-plugin-markerview-v9:0.4.0") {
                exclude group: 'com.mapbox.mapboxsdk', module: 'mapbox-android-sdk'
            }
        }
    }
}

allprojects {
    repositories {
        // ...
        maven {
            url = "https://dl.bintray.com/maplibre/maplibre-gl-native"
        }
    }
}
```

Feel free to check out the `/example` projects [`android/build.gradle`](https://github.com/react-native-mapbox-gl/maps/blob/master/example/android/build.gradle) for inspiration!
