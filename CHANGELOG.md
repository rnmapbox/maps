## 7.0.0

### Breaking changes:

* iOS mapbox libraries updated to [5.5.0](https://github.com/mapbox/mapbox-gl-native/releases/tag/ios-v5.3.2) android libraries updated to [8.2.1](https://github.com/mapbox/mapbox-gl-native/releases/tag/android-v8.2.1)
* `StyleSheet.create` removed.
Mapbox styles are now just a map no need for `StyleSheet.create`.
`StylesSheet.identity` also removed, use expressions array instead:
   ```jsx
   mapboxStyle=MapboxGL.Stylesheet.create({..., fillColor: MapboxGL.Stylesheet.identity('color') ...})
   ...
   <MapView
     ...
     <FillLayer style={mapboxStyle}... />
   </MapView>
   ```

   is now:
   ```jsx
   mapboxStyle={..., fillColor: ['get', 'color'] ...}
   ...
   <MapView
     ...
     <FillLayer style={mapboxStyle}... />
   </MapView>
   ```
  See [docs/StyleSheet.md](docs/StyleSheet.md) for more examples
* `isTelemetryEnabled` removed (as no longer supported on android) [#1](https://github.com/mfazekas/maps/pull/1)
* MapView#flyTo, MapView#bitBounds, MapView#flyTo, MapView#moveTo, MapView#zoomTo, MapView#setCamera moved to Camera. There is also experimantal properties, to replace those. See [docs/Camera.md](docs/Camera.md)
* Camera related properties on `MapView` now have to be specified on a camera object:
   ```jsx
   <MapView
      zoomLevel={8}
      centerCoordinate={[-111.8678, 40.2866]}
      ...
   >
      ...
   </MapView>
   ```

   is now:

   ```jsx
   <MapView
     ...
   >
     <Camera
        zoomLevel={8}
        centerCoordinate={[-111.8678, 40.2866]}
     />
   </MapView>
   ```
   See [docs/Camera.md](docs/Camera.md) for more examples
* User tracking properties moved from `MapView` to `Camera`
   ```jsx
   <MapView
      userTrackingMode={UserTrackingModes.Follow}
      ...
   >
      ...
   </MapView>
   ```

   is now:

   ```jsx
   <MapView
     ...
   >
     <Camera
        followUserLocation=true
        followUserMode="normal"
     />
   </MapView>
   ```
   The following properties were changed:
   * MapView#userTrackingMode is now Camera#followUserMode and Camera#followUserLocation
   * followUserMode is now a string with ('normal','compass','course'), and UserTrackingModes enum is deprecated
   * MapView#onUserTrackingModeChange is now Camera#onUserTrackingModeChange and payload contains followUserMode and followUserLocation.

* ShapeSource#images was depreacted, use Images#images instead.
   ```jsx
   <MapView
     ...
   >
     ...
     <Images images={{pin, dot}} />
     ...
     <ShapeSource ... >
        <SymbolLayer ...>
     </ShapeSource>
   </MapView>
   ```

* TODO document all changes
