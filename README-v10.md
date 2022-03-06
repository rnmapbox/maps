## Getting Started


```
react-native init sample --version 0.60.5
cd sample
yarn add https://github.com/rnmapbox/maps#main --save

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
      RNMapboxMapsImpl = 'mapbox'
    }
}
```

code ios/Podfile
# change these
```
  $RNMapboxMapsImpl = 'mapbox'

  platform :ios, '13.0'

  ...

  ...

  pre_install do |installer|
    $RNMapboxMaps.pre_install(installer)
  end
  
  post_install do |installer|
    react_native_post_install(installer)
    $RNMapboxMaps.post_install(installer)
  end
```


# on RN 0.60 only:
# add modular_headers to `React-Core`
#  pod 'React-Core', :path => '../node_modules/react-native/React', modular_headers: true


IOS:

 * Add $(SDKROOT)/usr/lib/swift to Libary search paths.

