# Manual installation process

_Make sure to follow these directions carefully._

First,
```bash
npm install react-native-mapbox-gl --save
```

1: In the Xcode's `Project navigator`, right click on project's name ➜ `Add Files to <...>`. Add `node_modules/react-native-mapbox-gl/ios/RCTMapboxGL.xcodeproj`

![](https://dl.dropboxusercontent.com/s/6trwtezp3009eot/2016-03-14%20at%2012.52%20PM.png)

![](https://cldup.com/DTD2UZMYu5.png)

2: Select your project in the `Project navigator`. Click `General` tab then add `node_modules/react-native-mapbox-gl/ios/Mapbox.framework` to `Embedded Binaries`. :collision: **Important, make sure you're adding it to general -> `Embedded Binaries` :collision:**

![](https://cldup.com/s4U3JfS_-l.png)

3: In the `Build Phases` tab, click the plus sign and then `New Run Script Phase`

![](https://cldup.com/jgt8p_dHjD.png)

4: Open the newly added `Run Script` and paste (Only necessary when submitting to the app store, but a good idea to add this now):

```bash
 "${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}/Mapbox.framework/strip-frameworks.sh"
```

![](https://cldup.com/SGt3NdX-yy.png)

5: In `Build Phases` tab, click `Link Binaries With Libraries` and add `libRCTMapboxGL.a`

![](https://cldup.com/FuOlGOwAli.png)

6: Add to project, [see example](./example.js)
