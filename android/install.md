#### Step 1 - NPM Install

Run with ```--ignore-scripts``` if you don't want to download the iOS SDK, as well.

```shell
npm install --save react-native-mapbox-gl --ignore-scripts
```

#### Step 2 - Use with Gradle

##### Option A - Automatically

```shell
react-native link
```

##### Option B - Manually

Edit the following files:

```gradle
// file: android/settings.gradle
...

include ':reactnativemapboxgl'
project(':reactnativemapboxgl').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-mapbox-gl/android')
```

```gradle
// file: android/app/build.gradle
...

dependencies {
    ...
    compile project(':reactnativemapboxgl')
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
