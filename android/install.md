# Android Installation

## Supported mapbox libraries

We support Mapbox Maps SDK v11.

### Adding mapbox maven repo

Then under section `allprojects/repositories` add your data:

```groovy
// android/build.gradle

allprojects {
    repositories {
        // ...other repos
        maven {
            url 'https://api.mapbox.com/downloads/v2/releases/maven'
        }
        // ...even more repos?
    }
}
```

*Note:* mapbox lifted auth requirement from downloads so MAPBOX_DOWNLOADS_TOKEN is no longer needed

### Using non default mapbox version

*Warning*: If you set a custom version, make sure you revisit any time you update @rnmapbox/maps. Setting it to an earlier version than what we expect will likely result in a build error.

Set `RNMapboxMapsVersion` in `android/build.gradle > buildscript > ext` section

```groovy
buildscript {
    ext {
        RNMapboxMapsVersion = '11.16.2'
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


