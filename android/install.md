#### Note

If you were using react-native-mapbox-gl before we moved it into the mapbox npm org.
You will need to unlink react-native-mapbox-gl and link @mapbox/react-native-mapbox-gl

#### Step 1 - NPM Install

Run with ```--ignore-scripts``` if you don't want to download the iOS SDK, as well.

```shell
npm install --save @mapbox/react-native-mapbox-gl --ignore-scripts
```

#### Step 2 - Use with Gradle

##### Option A - Automatically

```shell
react-native link @mapbox/react-native-mapbox-gl
```

##### Option B - Manually

Edit the following files:

```gradle
// file: android/settings.gradle
...

include ':@mapbox/react-native-mapbox-gl'
project(':@mapbox/react-native-mapbox-gl').projectDir = new File(rootProject.projectDir, '../node_modules/@mapbox/react-native-mapbox-gl/android')
```

```gradle
// file: android/app/build.gradle
...

dependencies {
    ...
    compile project(':@mapbox/react-native-mapbox-gl')
}
```

```java
// file: android/app/src/main/java/com/yourcompany/yourapp/MainApplication.java
import com.mapbox.reactnativemapboxgl.ReactNativeMapboxGLPackage; // <-- import
...
/**
   * A list of packages used by the app. If the app uses additional views
   * or modules besides the default ones, add more packages here.
   */
    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new ReactNativeMapboxGLPackage());  // <-- Register package here
    }
```

#### Step 3 - Add Mapbox to AndroidManifest.xml

Add the following permissions to the `<manifest>` root node of your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

Also, add the Mapbox analytics service to the `<application>` node:

```xml
<service android:name="com.mapbox.mapboxsdk.telemetry.TelemetryService"/>
```

#### Step 4 - Add to project, [see example](../example.js)

#### Troubleshoot

You may get `com.android.dex.DexException: Multiple dex files define Lokhttp3/internal/ws/WebSocketReader$FrameCallback`
error when building the android app. You can solve it by adding this.
```gradle
// file: android/app/build.gradle
...

configurations.all {
    resolutionStrategy {
        force "com.squareup.okhttp3:okhttp:3.4.2"
        force "com.squareup.okhttp3:okhttp-ws:3.4.2"
    }
}
```
