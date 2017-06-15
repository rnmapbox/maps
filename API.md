# API Docs

## Access token

The first thing you need to do before using the map is getting a Mapbox access
token by [signing up to a Mapbox account](https://www.mapbox.com/signup).

Then, make sure you run this before mounting any `MapView`s:

```javascript
import Mapbox from 'react-native-mapbox-gl';
Mapbox.setAccessToken('your-mapbox.com-access-token');
```

## Props

Import the component to use it:

```jsx
import { MapView } from 'react-native-mapbox-gl';
<MapView />
```

| Prop | Type | Required | Description | Default |
|---|---|---|---|---|
| `initialCenterCoordinate` | `object` | Optional | Initial `latitude`/`longitude` the map will load at. | `{ latitude:0, longitude: 0 }` |
| `initialZoomLevel` | `number` | Optional | Initial zoom level the map will load at. 0 is the entire world, 18 is rooftop level. | `0` |
| `initialDirection`  | `number` | Optional | Initial heading of the map in degrees, where 0 is north and 180 is south | `0` |
| `rotateEnabled` | `boolean`  |  Optional | Whether the map can rotate. | `true`  |
| `scrollEnabled` | `boolean`  |  Optional | Whether the map can be scrolled. | `true`  |
| `zoomEnabled` | `boolean`  |  Optional | Whether the map zoom level can be changed. | `true`  |
| `pitchEnabled` | `boolean`  |  Optional | Whether the map pitch (tilt) level can be changed via a two-finger drag (iOS) or three-finger drag (Android). | `true`  |
| `annotationsPopUpEnabled` | `boolean`  |  Optional | Whether annotations popups can be shown. | `true`  |
| `showsUserLocation` | `boolean` | Optional | Whether the user's location is shown on the map. Note: The map will not zoom to their location. | `false` |
| `userTrackingMode` | `enum` | Optional | Whether the map is zoomed to and follows the user's location. One of `Mapbox.userTrackingMode.none`, `Mapbox.userTrackingMode.follow`, `Mapbox.userTrackingMode.followWithCourse`, `Mapbox.userTrackingMode.followWithHeading` | `Mapbox.userTrackingMode.none` |
| `userLocationVerticalAlignment` | `enum` | Optional | Change the alignment of where the user location shows on the screen. One of `Mapbox.userLocationVerticalAlignment.top`, `Mapbox.userLocationVerticalAlignment.center`, `Mapbox.userLocationVerticalAlignment.bottom` | `Mapbox.userLocationVerticalAlignment.center` |
| `styleURL` | `string` | Optional |  A Mapbox style. See [Styles](#styles) for valid values. | `Mapbox.mapStyles.streets` |
| `annotations` | `array` | Optional |  An array of annotation objects. See [Annotations](#annotations) | `[]` |
| `annotationsAreImmutable`  | `boolean` | Optional | Set this to `true` if you don't ever mutate the `annotations` array or the annotations themselves. This enables optimizations when props change. | `false` |
| `attributionButtonIsHidden`  | `boolean` | Optional | Whether attribution button is visible in lower right corner. *[If true you must still attribute OpenStreetMap in your app.](https://www.mapbox.com/about/maps/)* | `false` |
| `logoIsHidden`  | `boolean` | Optional | Whether logo is visible in lower left corner. | `false` |
| `compassIsHidden`  | `boolean` | Optional | Whether compass is visible when map is rotated. | `false` |
| `contentInset` | `array` | Optional | Change the padding of the viewport of the map. Offset is in pixels. `[top, right, bottom, left]` `[0, 0, 0, 0]` |
| `style`  | React styles | Optional | Styles the actual map view container | N/A |
| `debugActive`  | `boolean` | Optional | Turns on debug mode. | `false` |
| `children` | `array` | Optional |  An array of custom Annotation views. See [Custom Annotations](#custom-annotations). | null |


## Callback props

```javascript
<MapView onSomethingHappened={payload => {
  //...
}}/>
```

| Prop | Payload shape | Description
|---|---|---|
| `onRegionWillChange` | `{latitude: 0, longitude: 0, zoomLevel: 0, direction: 0, pitch: 0, animated: false}` | Fired when the map begins panning or zooming. `animated` indicates whether the action is user-driven or animation-driven.
| `onRegionDidChange` | `{latitude: 0, longitude: 0, zoomLevel: 0, direction: 0, pitch: 0, animated: false}` | Fired when the map ends panning or zooming.
| `onOpenAnnotation` | `{id: 'marker_id', title: null, subtitle: null, latitude: 0, longitude: 0}` | Fired when tapping an annotation.
| `onRightAnnotationTapped` | `{id: 'marker_id', title: null, subtitle: null, latitude: 0, longitude: 0}` | Fired when user taps the `rightCalloutAccessory` of an annotation.
| `onChangeUserTrackingMode` | `Mapbox.userTrackingMode.none` | Fired when the user tracking mode gets changed by an user pan or rotate.
| `onUpdateUserLocation` | `{latitude: 0, longitude: 0, verticalAccuracy: 0, horizontalAccuracy: 0, headingAccuracy: 0, magneticHeading: 0, trueHeading: 0, isUpdating: false}` | Fired when the user's location updates. `headingAccuracy` and `isUpdating` are only supported on iOS. `verticalAccuracy` and `horizontalAccuracy` will be the same on Android, or might not exist in some circumstances.
| `onLocateUserFailed` | `{message: 'Error message'}` | Fired when there is an error getting the user's location. Do not rely on the string that is returned for determining what kind of error it is.
| `onTap` | `{latitude: 0, longitude: 0, screenCoordX: 0, screenCoordY: 0}` | Fired when the users taps the screen.
| `onLongPress` | `{latitude: 0, longitude: 0, screenCoordX: 0, screenCoordX: 0}` | Fired when the user taps and holds screen for 1 second.
| `onStartLoadingMap` | `undefined` | Fired once the map begins loading the style. |
| `onFinishLoadingMap` | `undefined` | Fired once the map has loaded the style. |

## Methods

You first need to get a ref to your `MapView` component:

```jsx
<MapView ref={map => { this._map = map; }} />
```

Then call methods as `this._map.methodName()`.

---

```javascript
this._map.setDirection(direction, animated = true, callback);
this._map.setZoomLevel(zoomLevel, animated = true, callback);
this._map.setCenterCoordinate(latitude, longitude, animated = true, callback);
this._map.setCenterCoordinateZoomLevel(latitude, longitude, zoomLevel, animated = true, callback);
this._map.setCenterCoordinateZoomLevelPitch(latitude, longitude, zoomLevel, pitch, animated = true, callback);
this._map.setPitch(pitch, animated = true, callback);
this._map.easeTo({ latitude, longitude, zoomLevel, altitude, direction, pitch }, animated = true, callback);
```

This set of methods sets the location the map is centered on, the zoom level,
the heading and the pitch of the map.

The transition to the desired location is animated by default, but can be made
instantaneous by passing `animated` as `false`.

For `easeTo`, all arguments inside the options object are optional. You can specify
any combination of center coords, zoomLevel, altitude, direction and pitch. What is not
specified stays at their current values.

The `altitude` refers to the viewing altitude of the camera. It's a replacement for `zoomLevel`,
hence `zoomLevel` and `altitude` must not be specified at the same time.

On iOS, `pitch` can't be specified at the same time as `zoomLevel`. `altitude` must
be used instead.

`altitude` is not available on Android.

The methods accept an optional `callback` that will get fired when the animation
has ended. Additionally, the return value is a promise that gets resolved when the
animation has ended.

---

```javascript
this._map.setVisibleCoordinateBounds(latitudeSW, longitudeSW, latitudeNE, longitudeNE, paddingTop = 0, paddingRight = 0, paddingBottom = 0, paddingLeft = 0, animated = true);
```

This method adjusts the center location and the zoomLevel of the map so that
the rectangle determined by `latitudeSW`, `longitudeSW`, `latitudeNE`,
`longitudeNE` fits inside the viewport.

You can optionally pass a minimum padding (in screen points) that will be
visible around the given coordinate bounds.

The transition is animated unless you pass `animated` as `false`.

---

```javascript
this._map.getCenterCoordinateZoomLevel(data => {
  // ...
});
```

Gets the current coordinates and zoom level of the map.

`data` is an object of the form `{ latitude, longitude, zoomLevel }`

---

```javascript
this._map.getDirection(direction => {
  // ...
});
```

Gets the current heading of the map.

`direction` is the heading in degrees.

---

```javascript
this._map.getPitch(pitch => {
  // ...
});
```

Gets the current tilt of the map. (Android only)

`pitch` is the tilt in degrees measured from the normal to the map.

---

```javascript
this._map.getBounds(bounds => {
  // ...
});
```

Gets the bounding rectangle in GPS coordinates that is currently visible on
within the map's viewport.

`bounds` is an array representing `[ latitudeSW, longitudeSW, latitudeNE, longitudeNE ]`

---

```javascript
this._map.selectAnnotation(id, animated = true);
```

Selects the annotation tagged with `id`, as if it would be tapped by the user.

The transition is animated unless you pass `animated` as `false`.

---

```javascript
this._map.deselectAnnotation();
```

Deselects the previously selected annotation.

---

```javascript
this._map.queryRenderedFeatures({
  point: { // required if rect not defined. Point on screen
    screenCoordX: 287,
    screenCoordY: 493
  },
  rect: { // required if point not defined. Dimensions of rectangle on screen
    left: 267,
    top: 473,
    right: 307,
    bottom: 513
  },
  layers: ['building'] // optional. Array of layer names
},
callback // optional. Alternative to returned promise
);
```

Queries the features in the vector tiles at given `point` or `rect`. (iOS only - Android SDK's `queryRenderedFeatures` is in beta)

All layers are queried unless you pass an array of layer names into `layers`.

This method returns a promise that resolves with an array of GeoJSON features. It also optionally takes a `callback` as a second parameter with the signature `(err, features) => {}`.

## Styles

#### Default styles

Mapbox GL ships with 6 included styles:

* `Mapbox.mapStyles.streets`
* `Mapbox.mapStyles.dark`
* `Mapbox.mapStyles.light`
* `Mapbox.mapStyles.satellite`
* `Mapbox.mapStyles.hybrid`
* `Mapbox.mapStyles.emerald` (deprecated)

To use one of these, just pass it as a prop to `MapView`:

```jsx
<MapView
  styleURL={Mapbox.mapStyles.emerald}
/>
```

#### Custom styles

You can also create a custom style in [Mapbox Studio](https://www.mapbox.com/studio/) and add it your map. Simply grab the style url. It should look something like:

```
mapbox://styles/bobbysud/cigtw1pzy0000aam2346f7ex0
```

## Annotations

#### Object shape

```javascript
[{
  coordinates, // required. For type polyline and polygon must be an array of arrays. For type point, array as [latitude longitude]
  type, // required. One of 'point', 'polyline' or 'polygon'
  title, // optional. Title string. Appears when marker pressed
  subtitle, // optional. Subtitle string. Appears when marker pressed
  fillAlpha, // optional. number. Only for type=polygon. Controls the opacity of the polygon
  fillColor, // optional. string. Only for type=polygon. CSS color (#rrggbb). Controls the fill color of the polygon
  strokeAlpha, // optional. number. Only for type=polygon or type=polyline. Controls the opacity of the line
  strokeColor, // optional. string. Only for type=polygon or type=polyline. CSS color (#rrggbb). Controls line color.
  strokeWidth, // optional. number. Only for type=polygon or type=polyline. Controls line width.
  id, // required. string. Unique identifier used for adding or selecting an annotation.
  annotationImage: { // optional. Marker image for type=point
    source: {
      uri // required. string. Either remote image URL or the name (without extension) of a bundled image
    },
    height, // required. number. Image height
    width, // required. number. Image width
  },
  rightCalloutAccessory: { // optional. iOS only. Clickable image that appears when type=point marker pressed
    source: {
      uri // required. string. Either remote image URL or the name (without extension) of a bundled image
    },
    height, // required. number. Image height
    width, // required. number. Image width
  },
}]
```
**For using locally bundled images, on iOS see [adding static resources to your app using Images.xcassets  docs](https://facebook.github.io/react-native/docs/image.html#adding-static-resources-to-your-app-using-images-xcassets)
and on Android, put images in `android/app/src/main/res/drawable/yourImage.png`**.

#### Example

```javascript
annotations: [{
  coordinates: [40.72052634, -73.97686958312988],
  type: 'point',
  title: 'This is marker 1',
  subtitle: 'It has a rightCalloutAccessory too',
  rightCalloutAccessory: {
    source: { uri: 'https://cldup.com/9Lp0EaBw5s.png' },
    height: 25,
    width: 25
  },
  annotationImage: {
    source: { uri: 'https://cldup.com/CnRLZem9k9.png' },
    height: 25,
    width: 25
  },
  id: 'marker1'
}, {
  coordinates: [40.714541341726175,-74.00579452514648],
  type: 'point',
  title: 'Important',
  subtitle: 'Neat, this is a custom annotation image',
  annotationImage: {
    source: { uri: 'https://cldup.com/7NLZklp8zS.png' },
    height: 25,
    width: 25
  },
  id: 'marker2'
}, {
  coordinates: [[40.76572150042782,-73.99429321289062],[40.743485405490695, -74.00218963623047],[40.728266950429735,-74.00218963623047],[40.728266950429735,-73.99154663085938],[40.73633186448861,-73.98983001708984],[40.74465591168391,-73.98914337158203],[40.749337730454826,-73.9870834350586]],
  type: 'polyline',
  strokeColor: '#00FB00',
  strokeWidth: 3,
  strokeAlpha: 0.5,
  id: 'line'
}, {
  coordinates: [[40.749857912194386, -73.96820068359375], [40.741924698522055,-73.9735221862793], [40.735681504432264,-73.97523880004883], [40.7315190495212,-73.97438049316406], [40.729177554196376,-73.97180557250975], [40.72345355209305,-73.97438049316406], [40.719290332250544,-73.97455215454102], [40.71369559554873,-73.97729873657227], [40.71200407096382,-73.97850036621094], [40.71031250340588,-73.98691177368163], [40.71031250340588,-73.99154663085938]],
  type: 'polygon',
  fillAlpha:1,
  fillColor: '#C32C2C',
  strokeColor: '#DDDDD',
  id: 'route'
}]
```

#### Immutability

When adding new annotations or modifying existing ones, it's recommended not
to mutate the annotations array, but rather treat it as immutable and create
a new one with the same objects plus your modifications.

If your `annotations` array is immutable and you enable `annotationsAreImmutable`,
this enables important performance optimizations when this component is
re-rendered.

See [the example](./example.js#L116) for an illustration of this.

#### Custom Annotations

If the default annotations do not offer enough options, you can embed react native
view directly onto the map as a custom marker view.

The children of the `MapView` must be `Annotation` views: `import {Annotation} from 'react-native-mapbox-gl'`.
The `Annotation` view has the following required props:

| Prop | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier for the annotation. |
| `coordinate` | `{latitude: number, longitude: number}` | Location of the annotation. |

###### Known Bugs

1. `Annotation` views do not position correctly unless they have the following style props:
  `style={{alignItems: 'center', justifyContent: 'center', position: 'absolute'}}`.

2. React Native views do not work with the regular `onAnnotationTapped` on need to
   add their own tap handling (e.g. by using a `TouchableHighlight`).

###### Example

```
<MapView {...MapView props}>
  <Annotation
    id="annotation1"
    coordinate={{latitude: 37.5, longitude: -122.2}}
    style={{alignItems: 'center', justifyContent: 'center', position: 'absolute'}}
  >
    <View style={{width: 100, height: 100, borderWidth: 4, borderColor: 'blue', borderRadius: 50, backgroundColor: 'white', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>React View</Text>
    </View>
  </Annotation>
  <Annotation
    id="annotation2"
    coordinate={{latitude: 37.55, longitude: -122.25}}
    style={{alignItems: 'center', justifyContent: 'center', position: 'absolute'}}
  >
    <View style={{width: 200, height: 200, borderWidth: 1, borderColor: 'red', borderRadius: 50, backgroundColor: 'white', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Image
        style={{width: 100, height: 100}}
        source={{uri: 'some-image-uri'}}
      />
    </View>
  </Annotation>
</MapView>
```

## Mapbox Telemetry (metrics)

If you hide the attribution button, you need to provide the user with a way to
opt-out of telemetry. For this, you need to add `MGLMapboxMetricsEnabledSettingShownInApp`
as `YES` in `Info.plist`, then create a switch that toggles metrics.

To get the current state of metrics, use `Mapbox.getMetricsEnabled()`.

To enable or disable metrics, use `Mapbox.setMetricsEnabled(enabled: boolean)`.

## Offline

There are 3 main methods for interacting with the offline API:
* `Mapbox.addOfflinePack`: Creates an offline pack
* `Mapbox.getOfflinePacks`: Returns an array of all offline packs on the device
* `Mapbox.removeOfflinePack`: Removes a single pack

Before using them, don't forget to set an access token with `Mapbox.setAccessToken(accessToken)`

These methods return a promise, but they also accept a callback as the last
argument with the signature `(err, value) => {}`.

#### Creating a pack

```javascript
Mapbox.addOfflinePack({
    name: 'test', // required
    type: 'bbox', // required, only type currently supported`
    metadata: { // optional. You can put any information in here that may be useful to you
        date: new Date(),
        foo: 'bar'
    },
    bounds: [ // required. The corners of the bounded rectangle region being saved offline
      latitudeSW, longitudeSW, latitudeNE, longitudeNE
    ],
    minZoomLevel: 10, // required
    maxZoomLevel: 13, // required
    styleURL: Mapbox.mapStyles.emerald // required. Valid styleURL
}).then(() => {
  // Called after the pack has been added successfully
}).catch(err => {
  console.error(err); // Handle error
});
```

#### Deleting a pack

To delete a pack, provide the `name` of the pack to delete.

```javascript
Mapbox.removeOfflinePack('test')
  .then(info => {
    if (info.deleted) {
      console.log(`Deleted pack named ${info.deleted}`); // The pack has been deleted successfully
    } else {
      console.log('No packs to delete'); // There are no packs named 'test'
    }
  })
  .catch(err => {
    console.error(err); // Handle error
  });
```

#### Querying progress

```javascript
Mapbox.getOfflinePacks()
  .then(packs => {
    // packs is an array of progress objects
  })
  .catch(err => {
    console.error(err); // Handle error
  })
```

A progress object has the following shape:

```javascript
{
  name: 'test', // The name this pack was registered with
  metadata, // The value that was previously passed as metadata
  countOfBytesCompleted: 0, // The number of bytes downloaded for this pack
  countOfResourcesCompleted: 0, // The number of tiles that have been downloaded for this pack
  countOfResourcesExpected: 0, // The estimated minimum number of total tiles in this pack
  maximumResourcesExpected: 0 // The estimated maximum number of total tiles in this pack
}
```

#### Subscribing to progress notifications

```javascript
const subscription = Mapbox.addOfflinePackProgressListener(progressObject => {
  // progressObject has the same format as above
});

// Remove the listener when it is not needed anymore
subscription.remove();
```

Due to high volume, progress notifications are throttled so as not to starve the
run loop and make the JS thread unresponsive.

By default, you'll get at most one progress notification per pack each 300 ms.

You can configure this interval with:

```javascript
Mapbox.setOfflinePackProgressThrottleInterval(milis);
```

#### Subscribing to error events

```javascript
const subscription = Mapbox.addOfflineErrorListener(payload => {
  console.log(`Offline pack named ${payload.name} experienced an error: ${payload.error}`);
});

// Remove the listener when it is not needed anymore
subscription.remove();
```

```javascript
const subscription = Mapbox.addOfflineMaxAllowedTilesListener(payload => {
  console.log(`Offline pack named ${payload.name} reached max tiles quota of ${payload.maxTiles} tiles`);
});

// Remove the listener when it is not needed anymore
subscription.remove();
```

Check out our [help page](https://www.mapbox.com/help/mobile-offline/) for more information on offline.
