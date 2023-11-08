# Android Installation

## Supported mapbox libraries

We're only supporting mabpox 10.0 releases. 11.0 beta has experimental support.

### Adding mapbox maven repo

You will need to authorize your download of the Maps SDK via a secret access token with the `DOWNLOADS:READ` scope.  
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

### Setting Mapbox implementation

Note 10.1 or later only supports mapbox 10 and 11 implementations. So you no longer need to set this variable:

Set `RNMapboxMapsImpl` in `android/build.gradle > buildscript > ext` section

```groovy
buildscript {
    ext {
        RNMapboxMapsImpl = 'mapbox'
    }
}
```

### Using non default mapbox version

*Warning*: If you set a custom version, make sure you revisit, any time you update @rnmapbox/maps. Setting it to earlier version than what we exepect will likely result in a build error.

Set `RNMapboxMapsLibs` in `android/build.gradle > buildscript > ext` section


```groovy
buildscript {
    ext {
        RNMapboxMapsVersion = '10.6.0'
    }
}
```

you can also customize all the libraries, should it be neccesary

```groovy
buildscript {
    ext {
        // ...
        RNMapboxMapsLibs = { // optional - only required if you want to customize it
            implementation 'com.mapbox.maps:android:10.6.0'
            implementation 'com.mapbox.mapboxsdk:mapbox-sdk-turf:5.4.1'
        }
    }
}
```

### Using v11

```groovy
buildscript {
    ext {
        RNMapboxMapsUseV11 = true
        RNMapboxMapsVersion = '10.6.0'
    }
}
```



# Troubleshooting

If you see `2 files found with path 'lib/arm64-v8a/libc++_shared.so' from inputs` issue see [possible workaround](#workaround-for-2-files-found-with-path-libarm64-v8alibc_sharedso-from-inputs).


### Workaround for 2 files found with path 'lib/arm64-v8a/libc++_shared.so' from inputs

```sh
code android/app/build.gradle
```

add the following
```gradle
android {
    packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
    }
}
```


