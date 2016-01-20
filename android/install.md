#### Step 1 - NPM Install

Run with ```--ignore-scripts``` to disable ios startup script

```shell
npm install --save react-native-mapbox-gl --ignore-scripts
```
#### Step 2 - Update Gradle Settings

```gradle
// file: android/settings.gradle
...

include ':reactnativemapboxgl'
project(':reactnativemapboxgl').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-mapbox-gl/android')
```

#### Step 3 - Update app Gradle Build

```gradle
// file: android/app/build.gradle
...

dependencies {
    ...
    compile project(':reactnativemapboxgl')
}
```

#### Step 4 - Register React Package

##### react-native < v0.18.0

```java
...
import com.mapbox.reactnativemapboxgl.ReactNativeMapboxGLPackage; // <-- import
...

public class MainActivity extends FragmentActivity implements DefaultHardwareBackBtnHandler {

    private ReactInstanceManager mReactInstanceManager;
    private ReactRootView mReactRootView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mReactRootView = new ReactRootView(this);
        mReactInstanceManager = ReactInstanceManager.builder()
                .setApplication(getApplication())
                .setBundleAssetName("index.android.bundle")
                .setJSMainModuleName("index.android")
                .addPackage(new MainReactPackage())
                .addPackage(new ReactNativeMapboxGLPackage()) // <-- Register package here
                .setUseDeveloperSupport(BuildConfig.DEBUG)
                .setInitialLifecycleState(LifecycleState.RESUMED)
                .build();
        mReactRootView.startReactApplication(mReactInstanceManager, "AwesomeProject", null);
        setContentView(mReactRootView);
    }
...
```

##### react-native >= v0.18.0

```java
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

#### Step 5 - Add to project, [see example](./example.js)
