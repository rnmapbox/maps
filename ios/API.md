# iOS API Docs

## Options

| Option | Type | Opt/Required | Default | Note |
|---|---|---|---|---|
| `accessToken` | `string` | Required | NA |Mapbox access token. Sign up for a [Mapbox account here](https://www.mapbox.com/signup).
| `centerCoordinate` | `object` | Optional | `0,0`| Initial `latitude`/`longitude` the map will load at, defaults to `0,0`.
| `zoomLevel` | `double` | Optional | `0` | Initial zoom level the map will load at. 0 is the entire world, 18 is rooftop level. Defaults to 0.
| `rotateEnabled` | `bool`  |  Optional | `true`  | Whether the map can rotate |
| `scrollEnabled` | `bool`  |  Optional | `true`  | Whether the map can be scrolled |
| `zoomEnabled` | `bool`  |  Optional | `true`  | Whether the map zoom level can be changed |
|`showsUserLocation` | `bool` | Optional | `false` | Whether the user's location is shown on the map. Note - the map will not zoom to their location.|
| `styleURL` | `string` | required | Mapbox Streets |  A Mapbox style. Defaults to `streets`.
| `annotations` | `array` | Optional | NA |  An array of annotation objects. See [annotation detail](https://github.com/bsudekum/react-native-mapbox-gl/blob/master/ios/API.md#annotations)
| `direction`  | `double` | Optional | `0` | Heading of the map in degrees where 0 is north and 180 is south |
| `debugActive`  | `bool` | Optional | `false` | Turns on debug mode. |
| `style`  | flexbox `view` | Optional | NA | Styles the actual map view container |
| `userTrackingMode` | `int` | Optional | `this.userTrackingMode.none` | Must add `mixins` to use. Valid values are `this.userTrackingMode.none`, `this.userTrackingMode.follow`, `this.userTrackingMode.followWithCourse`, `this.userTrackingMode.followWithHeading` |
| `attributionButtonIsHidden`  | `bool` | Optional | `false` | Whether attribution button is visible in lower right corner. *If true you must still attribute OpenStreetMap in your app. [Ref](https://www.mapbox.com/about/maps/)* |
| `logoIsHidden`  | `bool` | Optional | `false` | Whether logo is visible in lower left corner. |
| `compassIsHidden`  | `bool` | Optional | `false` | Whether compass is visible when map is rotated. |
| `contentInset` | `array` | Optional | `[0, 0, 0, 0]` | Change the center point of the map. Offset is in pixels. `[top, right, bottom, left]`
| `userLocationVerticalAlignment` | `enum` | Optional | `userLocationVerticalAlignment.center` | Change the alignment of where the user location shows on the screen. Valid values: `userLocationVerticalAlignment.top`, `userLocationVerticalAlignment.center`, `userLocationVerticalAlignment.bottom`

## Event listeners

| Event Name | Returns | Notes
|---|---|---|
| `onRegionChange` | `{latitude: 0, longitude: 0, zoom: 0}` | Fired when the map ends panning or zooming.
| `onRegionWillChange` | `{latitude: 0, longitude: 0, zoom: 0}` | Fired when the map begins panning or zooming.
| `onOpenAnnotation` | `{title: null, subtitle: null, latitude: 0, longitude: 0}` | Fired when focusing a an annotation.
| `onUpdateUserLocation` | `{latitude: 0, longitude: 0, headingAccuracy: 0, magneticHeading: 0, trueHeading: 0, isUpdating: false}` | Fired when the users location updates.
| `onRightAnnotationTapped` | `{title: null, subtitle: null, latitude: 0, longitude: 0}` | Fired when user taps `rightCalloutAccessory`
| `onTap` | `{latitude: 0, longitude: 0}` | Fired when the users taps the screen.
| `onLongPress` | `{latitude: 0, longitude: 0, screenCoordY, screenCoordX}` | Fired when the user taps and holds screen for 1 second.
| `onFinishLoadingMap` | does not return an object | Fired once the map has loaded the style |
| `onStartLoadingMap` | does not return an object | Fired once the map begins loading the style |
| `onLocateUserFailed` | `{message: message}` | Fired when there is an error getting the users location. Do not rely on the string that is returned for determining what kind of error it is. |
| `getCenterCoordinateZoomLevel` | `mapViewRef`, `callback` | Gets the current center location and zoom level. Returns a single callback object. |
| `getDirection` | `mapViewRef`, `callback` | Gets the current direction. Returns a single callback object. |
| `getBounds` | `mapViewRef`, `callback` | Gets the bounds of the current view. Returns array [latitudeSW, longitudeSW, latitudeNE, longitudeNE]. |
| `onOfflineProgressDidChange` | `{countOfResourcesCompleted: 7, countOfResourcesExpected: 1284, name: "test", countOfBytesCompleted: 306543, maximumResourcesExpected: 1284}` | Event fired when the progress of an offline pack changes while downloading. |
| `onOfflineMaxAllowedMapboxTiles` | `{maximumCount: number}` | Event fired when the maximum number of tiles has been hit. |
| `onOfflineDidRecieveError` | `{error: error}` | Event fired when there is an error while downloading a pack. |

## Methods for Modifying the Map State

These methods require you to use `MapboxGLMap.Mixin` to access the methods. Each method also requires you to pass in a string as the first argument which is equal to the `ref` on the map view you wish to modify. See the [example](https://github.com/mapbox/react-native-mapbox-gl/blob/master/ios/example.js) on how this is implemented.

| Method Name | Arguments | Notes
|---|---|---|
| `setDirectionAnimated` | `mapViewRef`, `heading` | Rotates the map to a new heading
| `setZoomLevelAnimated` | `mapViewRef`, `zoomLevel` | Zooms the map to a new zoom level
| `setCenterCoordinateAnimated` | `mapViewRef`, `latitude`, `longitude` | Moves the map to a new coordinate. Note, the zoom level stay at the current zoom level. Returns a promise for handling completion.
| `setCenterCoordinateZoomLevelAnimated` | `mapViewRef`, `latitude`, `longitude`, `zoomLevel` | Moves the map to a new coordinate and zoom level
| `setCameraAnimated` | `mapViewRef`, `latitude`, `longitude`, `fromDistance`, `pitch`, `heading`, `duration` | Sets viewing angle on the map
| `addAnnotations` | `mapViewRef`, `` (array of annotation objects, see [#annotations](https://github.com/bsudekum/react-native-mapbox-gl/blob/master/API.md#annotations)) | Adds annotation(s) to the map without redrawing the map. Note, this will remove all previous annotations from the map.
| `selectAnnotationAnimated` | `mapViewRef`, `marker id` | Open the callout of the selected annotation. This method requires that you supply an id to an annotation when creating. If 2 annotations have the same id, only the first annotation will be selected. Only works on annotation `type = 'point'``.
| `updateAnnotation`  | `mapViewRef`, `annotation object` | Replace annotation if it  exists on the map. This check happens based on the `id` of the object being passed in. The annotation will still be added if no previous one exists.
| `removeAnnotation`  | `mapViewRef`, `marker id` | Removes annotation from map. This method requires that you supply an id to an annotation when creating. If 2 annotations have the same id, only the first will be removed.
| `removeAllAnnotations`  | `mapViewRef`| Removes all annotations from the map.
| `setVisibleCoordinateBoundsAnimated`  | `mapViewRef`, `latitude1`, `longitude1`, `latitude2`, `longitude2`, `padding top`, `padding right`, `padding bottom`, `padding left`  | Changes the viewport to fit the given coordinate bounds and some additional padding on each side.
| `setUserTrackingMode` | `mapViewRef`, `userTrackingMode` | Modifies the tracking mode. Valid args: `this.userTrackingMode.none`, `this.userTrackingMode.follow`, `this.userTrackingMode.followWithCourse`, `this.userTrackingMode.followWithHeading`
| `addPackForRegion` | `mapRef` `{name, type, bounds, minZoomLevel, maxZoomLevel, style}` | Adds an offline region for a given bounding box. `name` is a string to represent an offline pack. `type` must be of type `bbox`. `bounds` is an array.  `minZoomLevel` is an number representing the minimum zoom level of the offline pack. `maxZoomLevel` is an number representing the maximum zoom level of the offline pack. `style` is a style url to download. `metadata` is an object you can use metadata about the pack.
| `getPacks` | `mapRef` `callback` | Returns a callback with an array of all offline packs on device. If the downloaded pack was not downloaded during the current session, the size will be 0.
| `removePack` | `mapRef` `name-of-pack` `callback` | Removes a pack from the device. The name corresponds to the `name` of the pack used when calling `addPackForRegion`

## Styles

This ships with 6 styles included:

* `streets`
* `emerald`
* `dark`
* `light`
* `satellite`
* `hybrid`

To use one of these, make you add mixins:

```js
mixins: [Mapbox.Mixin]
```

Then you can access each style by:

```jsx
styleURL={this.mapStyles.emerald}
```

## Custom styles

You can also create a custom style in [Mapbox Studio](https://www.mapbox.com/studio/) and add it your map. Simply grab the style url. It should look something like:

```
mapbox://styles/bobbysud/cigtw1pzy0000aam2346f7ex0
```

## Annotations
```json
[{
  "coordinates": "required. For type polyline and polygon must be an array of arrays. For type point, single array",
  "type": "required: point, polyline or polygon",
  "title": "optional string",
  "subtitle": "optional string",
  "fillAlpha": "optional, only used for type=polygon. Controls the opacity of polygon",
  "fillColor": "optional string hex color including #, only used for type=polygon",
  "strokeAlpha": "optional number from 0-1. Only used for type=poyline. Controls opacity of line",
  "strokeColor": "optional string hex color including #, used for type=polygon and type=polyline",
  "strokeWidth": "optional number. Only used for type=poyline. Controls line width",
  "id": "required string, unique identifier. Used for adding or selecting an annotation.",
  "rightCalloutAccessory": {
    "url": "Optional. Either remote image or specify via 'image!yourImage.png'",
    "height": "required if url specified",
    "width": "required if url specified"
  },
  "annotationImage": {
    "url": "Optional. Either remote image or specify via 'image!yourImage.png'",
    "height": "required if url specified",
    "width": "required if url specified"
  },
}]
```
**For adding local images via `image!yourImage.png` see [adding static resources to your app using Images.xcassets  docs](https://facebook.github.io/react-native/docs/image.html#adding-static-resources-to-your-app-using-images-xcassets)**.

#### Example
```json
annotations: [{
  "coordinates": [40.72052634, -73.97686958312988],
  "type": "point",
  "title": "This is marker 1",
  "subtitle": "It has a rightCalloutAccessory too",
  "rightCalloutAccessory": {
    "url": "https://cldup.com/9Lp0EaBw5s.png",
    "height": 25,
    "width": 25
  },
  "annotationImage": {
    "url": "https://cldup.com/CnRLZem9k9.png",
    "height": 25,
    "width": 25
  },
  "id": "marker1"
}, {
  "coordinates": [40.714541341726175,-74.00579452514648],
  "type": "point",
  "title": "Important",
  "subtitle": "Neat, this is a custom annotation image",
  "annotationImage": {
    "url": "https://cldup.com/7NLZklp8zS.png",
    "height": 25,
    "width": 25
  },
  "id": "marker2"
}, {
  "coordinates": [[40.76572150042782,-73.99429321289062],[40.743485405490695, -74.00218963623047],[40.728266950429735,-74.00218963623047],[40.728266950429735,-73.99154663085938],[40.73633186448861,-73.98983001708984],[40.74465591168391,-73.98914337158203],[40.749337730454826,-73.9870834350586]],
  "type": "polyline",
  "strokeColor": "#00FB00",
  "strokeWidth": 3,
  "strokeAlpha": 0.5,
  "id": "line"
}, {
  "coordinates": [[40.749857912194386, -73.96820068359375], [40.741924698522055,-73.9735221862793], [40.735681504432264,-73.97523880004883], [40.7315190495212,-73.97438049316406], [40.729177554196376,-73.97180557250975], [40.72345355209305,-73.97438049316406], [40.719290332250544,-73.97455215454102], [40.71369559554873,-73.97729873657227], [40.71200407096382,-73.97850036621094], [40.71031250340588,-73.98691177368163], [40.71031250340588,-73.99154663085938]],
  "type": "polygon",
  "fillAlpha":1,
  "fillColor": "#C32C2C",
  "strokeColor": "#DDDDD",
  "id": "route"
}]
```


### Offline

There are 3 main methods for interacting with the offline API:
* `addPackForRegion` - creates an offline pack
* `getPacks` - returns an array of all offline packs on the device
* `removePack` - removes a single pack

To create a pack:

```js
this.addPackForRegion(mapRef, {
    name: 'test', //required
    type: 'bbox', // required, only type currently supported`
    metadata: { // required. You can put any information in here that may be useful to you. Can be empty if no metadata is needed
        date: new Date(),
        foo: 'bar'
    },
    bounds: bounds, // latitudeSW, longitudeSW, latitudeNE, longitudeNE
    minZoomLevel: 10,
    maxZoomLevel: 13,
    styleURL: this.mapStyles.emerald // valid styleURL
});
```

You can view the progress of a pack that is downloading by listening on `onOfflineProgressDidChange`.

To delete a pack, provide the `name` of the pack to delete
```js
this.removePack(mapRef, 'test', (err, info)=> {
    if (err) console.log(err);
    if (info) {
        console.log('Deleted', info.deleted);
    } else {
        console.log('No packs to delete'); // There are no packs on the device
    }
});
```

Check out our [help page](https://www.mapbox.com/help/mobile-offline/) for more information on offline.
