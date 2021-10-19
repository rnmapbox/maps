# Android Installation

## React-Native > `0.60.0`

If you are using React-Native `0.60.0` or greater, you do not need to perform any additional steps due to the RN autolinking feature.

<br>

## Installation FAQ:

Q: I am receiving a `getDataNetworkTypeForSubscriber` error when attempting to display a MapView.

A: You need to add <uses-permission android:name="android.permission.READ_PHONE_STATE"/> to the `app/src/main/AndroidManifest.xml` file. Restart the app after. 
See this for more info (https://github.com/react-native-mapbox-gl/maps/issues/1286)


## Mapbox Maps SDK

If you want to set a custom version of the Mapbox SDK perform the following steps:

Add the following to your `android/build.gradle`:

under section `allprojects/repositories`

```groovy
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
```

Overwrite mapbox dependencies within your `android/app/build.gradle`:

```groovy
dependencies {
    // ...
    implementation 'com.mapbox.mapboxsdk:mapbox-android-sdk:9.6.1'
    implementation 'com.mapbox.mapboxsdk:mapbox-sdk-services:5.6.0'
    implementation 'com.mapbox.mapboxsdk:mapbox-android-plugin-annotation-v9:0.9.0'
    // ...
```

Check the current version of the SDK [here](https://docs.mapbox.com/android/maps/guides/).

If you are using newer versions of the SDK, you will need to authorize your download of the Maps SDK via a secret access token with the `DOWNLOADS:READ` scope.  
This [guide](https://docs.mapbox.com/android/maps/guides/install/#configure-credentials) explains how to configure the secret token under section `Configure your secret token`.

<br>

## Using MapLibre

[MapLibre](https://github.com/maplibre/maplibre-gl-native) is an OSS fork of MapboxGL

Overwrite mapbox dependecies within your `android/build.gradle`

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

repositories {
    // ...
    maven {
        url = "https://dl.bintray.com/maplibre/maplibre-gl-native"
    }
}
```
