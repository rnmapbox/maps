# Android Installation

## Gradle Setup

### project:build.gradle

We need to add some `repositories` in order to get our dependencies.

* `jcenter()`
* `https://jitpack.io`
* `http://maven.google.com`

```
allprojects {
    repositories {
        jcenter()
        maven { url "$rootDir/../node_modules/react-native/android" }
        maven { url "https://jitpack.io" }
        maven { url "https://maven.google.com" }
    }
}
```

### app:build.gradle

Add project under `dependencies`

```
dependencies {
    compile project(':mapbox-react-native-mapbox-gl')
}
```

### settings.gradle

Include project, so gradle knows where to find the project

```
include ':mapbox-react-native-mapbox-gl'
project(':mapbox-react-native-mapbox-gl').projectDir = new File(rootProject.projectDir, '../node_modules/@mapbox/react-native-mapbox-gl/android/rctmgl')
```


Checkout the [example application](../example/README.md) to see how it's configured for an example.
