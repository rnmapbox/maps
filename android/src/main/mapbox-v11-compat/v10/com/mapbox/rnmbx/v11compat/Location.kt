package com.rnmapbox.rnmbx.v11compat.location;

import android.Manifest.permission.ACCESS_COARSE_LOCATION
import android.Manifest.permission.ACCESS_FINE_LOCATION
import android.content.Context
import android.location.LocationManager
import android.os.Looper
import androidx.annotation.RequiresPermission
import com.mapbox.maps.MapView
import com.mapbox.maps.plugin.PuckBearingSource
import com.mapbox.maps.plugin.locationcomponent.LocationComponentPlugin2
import com.mapbox.maps.plugin.locationcomponent.location2 as _location2


import com.mapbox.android.core.location.LocationEngineResult as _LocationEngineResult

import com.mapbox.android.core.location.LocationEngine as _LocationEngine
import com.mapbox.android.core.location.LocationEngineCallback as _LocationEngineCallback
import com.mapbox.android.core.location.LocationEngineRequest
import com.mapbox.android.core.location.LocationEngineProvider
import com.mapbox.common.location.LocationService
import com.mapbox.common.location.LocationUpdatesReceiver
import com.mapbox.common.location.LocationServiceFactory


import android.location.Location as _Location
//import com.mapbox.common.location.Location as _Location

typealias Location = _Location;
typealias PuckBearingSource = com.mapbox.maps.plugin.PuckBearingSource

val MapView.location2 : LocationComponentPlugin2
    get() = _location2

typealias LocationEngine = _LocationEngine
typealias LocationEngineResult = _LocationEngineResult
typealias LocationEngineCallback = _LocationEngineCallback<LocationEngineResult>

const val DEFAULT_FASTEST_INTERVAL_MILLIS: Long = 1000
const val DEFAULT_INTERVAL_MILLIS: Long = 1000

@RequiresPermission(anyOf = [ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION])
fun LocationEngine.requestLocationUpdatesV11(callback: LocationEngineCallback, looper: Looper?, minDisplacement: Float?) {
  val builder = LocationEngineRequest.Builder(DEFAULT_INTERVAL_MILLIS)
      .setFastestInterval(DEFAULT_FASTEST_INTERVAL_MILLIS)
      .setPriority(LocationEngineRequest.PRIORITY_HIGH_ACCURACY)
  if (minDisplacement != null && minDisplacement > 0.0) {
    builder.setDisplacement(minDisplacement)
  }
  val request = builder
      .build();

  this.requestLocationUpdates(
    request,
    callback,
    looper
  )
}

val Location.timestamp: Long
  get() = this.time

fun createLocationEngine(context: Context): LocationEngine {
    return LocationEngineProvider.getBestLocationEngine(context)
}