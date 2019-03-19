## <MapboxGL.offlineManager />
### OfflineManager implements a singleton (shared object) that manages offline packs.<br/>All of this class’s instance methods are asynchronous, reflecting the fact that offline resources are stored in a database.<br/>The shared object maintains a canonical collection of offline packs.


### methods
#### createPack(options[, progressListener][, errorListener])

Creates and registers an offline pack that downloads the resources needed to use the given region offline.

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `options` | `OfflineCreatePackOptions` | `Yes` | Create options for a offline pack that specifices zoom levels, style url, and the region to download. |
| `progressListener` | `Callback` | `No` | Callback that listens for status events while downloading the offline resource. |
| `errorListener` | `Callback` | `No` | Callback that listens for status events while downloading the offline resource. |



```javascript
const progressListener = (offlineRegion, status) => console.log(offlineRegion, status);
const errorListener = (offlineRegion, err) => console.log(offlineRegion, err);

await MapboxGL.offlineManager.createPack({
  name: 'offlinePack',
  styleURL: 'mapbox://...',
  minZoom: 14,
  maxZoom: 20,
  bounds: [[neLng, neLat], [swLng, swLat]]
}, progressListener, errorListener)
```


#### deletePack(name)

Unregisters the given offline pack and allows resources that are no longer required by any remaining packs to be potentially freed.

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `name` | `String` | `Yes` | Name of the offline pack. |



```javascript
await MapboxGL.offlineManager.deletePack('packName')
```


#### getPacks()

Retrieves all the current offline packs that are stored in the database.

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |




```javascript
const offlinePacks = await MapboxGL.offlineManager.getPacks();
```


#### getPack(name)

Retrieves an offline pack that is stored in the database by name.

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `name` | `String` | `Yes` | Name of the offline pack. |



```javascript
const offlinePack = await MapboxGL.offlineManager.getPack();
```


#### setTileCountLimit(limit)

Sets the maximum number of Mapbox-hosted tiles that may be downloaded and stored on the current device.<br/>The Mapbox Terms of Service prohibits changing or bypassing this limit without permission from Mapbox.

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `limit` | `Number` | `Yes` | Map tile limit count. |



```javascript
MapboxGL.offlineManager.setTileCountLimit(1000);
```


#### setProgressEventThrottle(throttleValue)

Sets the value at which download status events will be sent over the React Native bridge.<br/>These events happening very very fast default is 500ms.

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `throttleValue` | `Number` | `Yes` | event throttle value in ms. |



```javascript
MapboxGL.setProgressEventThrottle(500);
```


#### subscribe(packName, progressListener, errorListener)

Subscribe to download status/error events for the requested offline pack.<br/>Note that createPack calls this internally if listeners are provided.

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `packName` | `String` | `Yes` | Name of the offline pack. |
| `progressListener` | `Callback` | `Yes` | Callback that listens for status events while downloading the offline resource. |
| `errorListener` | `Callback` | `Yes` | Callback that listens for status events while downloading the offline resource. |



```javascript
const progressListener = (offlinePack, status) => console.log(offlinePack, status)
const errorListener = (offlinePack, err) => console.log(offlinePack, err)
MapboxGL.offlineManager.subscribe('packName', progressListener, errorListener)
```


#### unsubscribe(packName)

Unsubscribes any listeners associated with the offline pack.<br/>It's a good idea to call this on componentWillUnmount.

##### arguments
| Name | Type | Required | Description  |
| ---- | :--: | :------: | :----------: |
| `packName` | `String` | `Yes` | Name of the offline pack. |



```javascript
MapboxGL.offlineManager.unsubscribe('packName')
```



