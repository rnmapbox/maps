# Manual installation process

_Make sure to follow these directions carefully._

First,
```bash
npm install react-native-mapbox-gl --save
```

### 1: Adding RCTMapboxGL.xcodeproj

In the Xcode's `Project navigator`, right click on project's name ➜ `Add Files to <...>`. Add `node_modules/react-native-mapbox-gl/ios/RCTMapboxGL.xcodeproj`

![](https://dl.dropboxusercontent.com/s/6trwtezp3009eot/2016-03-14%20at%2012.52%20PM.png)

![](https://cldup.com/DTD2UZMYu5.png)

### 2: Adding Mapbox.framework

Select your project in the `Project navigator`. Click `General` tab then add `node_modules/react-native-mapbox-gl/ios/Mapbox.framework` to `Embedded Binaries`. :collision: **Important, make sure you're adding it to general -> `Embedded Binaries` :collision:**

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

### 5: Add to project, [see example](./example.js)
