## 7.0.0

### Breaking changes:

* isTelemeryEnbaled removed (as no longer supported on android) [#1](https://github.com/mfazekas/maps/pull/1)
* Camera related properties on MapView now have to specified on a camera object:
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
* User tracking properties moved from MapView to Camera
   ```jsx
   <MapView
      userTrackingMode={UserTrackingModes.Follow}
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
        followUserLocation=true
        followUserMode="follow"
     />
   </MapView>
   ``` 
   The following properties were changed:
   * MapView#userTrackingMode is now Camera#followUserMode and Camera#followUserLocation
   * followUserMode is now a string with ('normal','compass','course'), and UserTrackingModes enum is deprecated
   * MapView#onUserTrackingModeChange is now Camera#onUserTrackingModeChange and payload contains followUserMode and followUserLocation. 

* TODO document all changes
