# Android Installation

## If you are using autolinking feature introduced in React-Native `0.60.0` you can skip `react-native link react-native-mapbox-gl` command and just follow first paragraph

`react-native link` should get you almost there,  
however we need to add some additional lines to `build.gradle`.

    
## 1. `android/build.gradle`
We need to add an additional repository in order to get our dependencies.

* `https://jitpack.io`

```diff
allprojects {
    repositories {
        mavenLocal()
        google()
        jcenter()
+       maven { url "https://jitpack.io" }
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url "$rootDir/../node_modules/react-native/android"
        }
    }
}
```

Make sure that your `buildscript > ext` settings are correct.
We want to be on `28` or higher:

```
buildscript {
    ext {
        buildToolsVersion = "28.0.3"
        compileSdkVersion = 28
        targetSdkVersion = 28
    }
}
```

Everything below should've been covered by `react-native link`,   
however it never hurts to make sure it actually did what it was supposed to

---


## 2. `android/app/build.gradle`

Add project under `dependencies`

```diff
dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])
    implementation "com.android.support:appcompat-v7:${rootProject.ext.supportLibVersion}"
    implementation "com.facebook.react:react-native:+"  // From node_modules
+   implementation project(':@react-native-mapbox-gl_maps')
}
```

You can set the Support Library version or the okhttp version if you use other modules that depend on them:
* `supportLibVersion "28.0.0"`
* `okhttpVersion "3.12.1"`


## 3. `android/settings.gradle`

Include project, so gradle knows where to find the project

```diff
rootProject.name = <YOUR_PROJECT_NAME>

+include ':@react-native-mapbox-gl_maps'
+project(':@react-native-mapbox-gl_maps').projectDir = new File(rootProject.projectDir, '../node_modules/@react-native-mapbox-gl/maps/android/rctmgl')

include ':app'¬
```

## 4. `android/app/src/main/java/com/PROJECT_NAME/MainApplication.java`

We need to register our package

Add `import com.mapbox.rctmgl.RCTMGLPackage;`  
as an import statement and  
`new RCTMGLPackage()` within the `getPackages()` method

```diff
package <YOUR_PROJECT_NAME>;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
+import com.mapbox.rctmgl.RCTMGLPackage;

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
+         new RCTMGLPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
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
