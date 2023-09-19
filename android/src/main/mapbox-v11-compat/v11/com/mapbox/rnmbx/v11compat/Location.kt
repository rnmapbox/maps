package com.mapbox.rnmbx.v11compat.location;

import android.os.Looper
import com.mapbox.common.location.Location as _Location
import com.mapbox.maps.MapView
import com.mapbox.maps.plugin.PuckBearing
import com.mapbox.maps.plugin.locationcomponent.LocationComponentPlugin
import com.mapbox.maps.plugin.locationcomponent.location

import com.mapbox.common.location.LocationProvider
import kotlin.math.absoluteValue

typealias PuckBearingSource = PuckBearing

val MapView.location2 : LocationComponentPlugin
  get() = location

var LocationComponentPlugin.puckBearingSource : PuckBearing
  get() = puckBearing
  set(value) {
    puckBearing = value
  }


typealias Location = _Location

data class LocationEngineResult(var lastLocation: Location?) {

}

interface LocationEngineCallback {
  fun onSuccess(locationEngineResult: LocationEngineResult)
  fun onFailure(e: Exception)
}
class LocationEngine {
  var locationProvider: LocationProvider? = null
}


fun LocationEngine.requestLocationUpdatesV11(callback: LocationEngineCallback, looper: Looper?, minDisplacement: Float?) {
 
}

fun LocationEngine.removeLocationUpdates(callback: LocationEngineCallback) {

}

fun LocationEngine.getLastLocation(callback: LocationEngineCallback) {
  locationProvider?.getLastLocation {
    it?.let { callback.onSuccess(
      LocationEngineResult(lastLocation= it)
    ) }
  }
}

val Location.accuracy: Double
  get() = ((this.verticalAccuracy?.absoluteValue ?: 0.0) +
          (this.horizontalAccuracy?.absoluteValue ?: 0.0))/2.0