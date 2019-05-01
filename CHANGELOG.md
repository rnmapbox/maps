## 7.0.0

### Breaking changes:

* isTelemeryEnbaled removed (as no longer supported on android) [#1](https://github.com/mfazekas/maps/pull/1)
* Camera related attributes on Mapbox now have to specified on a camera object:
   ```jsx
   <MapView
      zoomLevel={8}
      centerCoordinate={[-111.8678, 40.2866]}
      ...
   >
      ...
   </MapView>
   ```
    
   is now
   
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
* TODO document all changes
