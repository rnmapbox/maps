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

Update Android SDK version if you did `react-native init`, we want to be on `26` or higher.
* `compileSdkVersion 26`
* `buildToolsVersion "26.0.1"`
* `targetSdkVersion 26`

### settings.gradle

Include project, so gradle knows where to find the project

```
include ':mapbox-react-native-mapbox-gl'
project(':mapbox-react-native-mapbox-gl').projectDir = new File(rootProject.projectDir, '../node_modules/@mapbox/react-native-mapbox-gl/android/rctmgl')
```

### MainApplication.java

We need to register our package

Add `import com.mapbox.rctmgl.RCTMGLPackage;` as an import statement and
`new RCTMGLPackage()` in `getPackages()`

Here is an example
```
package com.rngltest;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.mapbox.rctmgl.RCTMGLPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new RCTMGLPackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
```
Checkout the [example application](../example/README.md) to see how it's configured for an example.
