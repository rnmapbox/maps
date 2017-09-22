#### Note

If you were using react-native-mapbox-gl before we moved it into the mapbox npm org.
You will need to unlink react-native-mapbox-gl and link @mapbox/react-native-mapbox-gl

# Manual installation process

_Make sure to follow these directions carefully._

First,
```bash
npm install @mapbox/react-native-mapbox-gl --save
```

### 1: Adding RCTMapboxGL.xcodeproj

In the Xcode's `Project navigator`, right click on the `Libraries` folder ➜ `Add Files to <...>`. Add `node_modules/@mapbox/react-native-mapbox-gl/ios/RCTMapboxGL.xcodeproj`

![](https://dl.dropboxusercontent.com/s/6trwtezp3009eot/2016-03-14%20at%2012.52%20PM.png)

![](https://cldup.com/DTD2UZMYu5.png)

### 2: Adding Mapbox.framework

Select your project in the `Project navigator`. Click `General` tab then add `node_modules/@mapbox/react-native-mapbox-gl/ios/Mapbox.framework` to `Embedded Binaries`. :collision: **Important, make sure you're adding it to general -> `Embedded Binaries` :collision:**

Click 'Add other' to open the file browser and select Mapbox.framework.

![](https://dl.dropboxusercontent.com/s/7bjl6hul1q955o0/2016-03-14%20at%2012.57%20PM.png)

Select the 'Copy items if needed' checkbox.

![](https://dl.dropboxusercontent.com/s/5ain808tuhalx30/2016-03-14%20at%201.02%20PM.png)

![](https://cldup.com/s4U3JfS_-l.png)

### 3: Adding the script

In the `Build Phases` tab, click the plus sign and then `New Run Script Phase`

![](https://cldup.com/jgt8p_dHjD.png)

Open the newly added `Run Script` and paste:

```bash
 "${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}/Mapbox.framework/strip-frameworks.sh"
```

![](https://cldup.com/SGt3NdX-yy.png)

### 4: Link Binaries with Libraries

In `Build Phases` tab, click `Link Binaries With Libraries` and add `libRCTMapboxGL.a`

![](https://cldup.com/FuOlGOwAli.png)

### 5: Update minimum iOS version to 8.0

React Native Mapbox GL doesn't support iOS version less than 8.0. Under **Targets** ⇢ **Deployment Info**, set the minimum version to 8.0.

![](https://dl.dropboxusercontent.com/s/yu3zyjy59p44cxb/2016-03-14%20at%201.15%20PM.png)

### 6: Add to project, [see example](../example.js)

If you already have an iOS Simulator running from before you followed these steps, you'll need to rebuild the project from XCode - automatic refresh won't bring in the changes you made to this build process.
