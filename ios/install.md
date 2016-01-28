# Manual installation process

_Make sure to follow these directions carefully._

First,
```bash
npm install react-native-mapbox-gl --save
```

1. In the Xcode's `Project navigator`, right click on project's name ➜ `Add Files to <...>`. Add `node_modules/react-native-mapbox-gl/ios/RCTMapboxGL.xcodeproj` ![](https://cldup.com/DTD2UZMYu5.png)
1. Select your project in the `Project navigator`. Click `General` tab then add `node_modules/react-native-mapbox-gl/ios/Mapbox.framework` to `Embedded Libraries`. :collision: **Important, make sure you're adding it to general -> `Embedded Libraries` :collision:** ![](https://cldup.com/s4U3JfS_-l.png)
1. In the `Build Phases` tab, click the plus sign and then `New Run Script Phase` ![](https://cldup.com/jgt8p_dHjD.png)
1. Open the newly added `Run Script` and paste (Only necessary when submitting to the app store, but a good idea to add this now):
```bash
 "${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}/Mapbox.framework/strip-frameworks.sh"
```
![](https://cldup.com/SGt3NdX-yy.png)
1. In `Build Phases` tab, click `Link Binaries With Libraries` and add `libRCTMapboxGL.a`
![](https://cldup.com/FuOlGOwAli.png)
1. Add to project, [see example](./example.js)
