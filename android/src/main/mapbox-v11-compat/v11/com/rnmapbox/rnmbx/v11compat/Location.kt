package com.rnmapbox.rnmbx.v11compat.location;

import android.content.Context
import android.os.Looper
import com.mapbox.common.location.AccuracyLevel
import com.mapbox.common.location.DeviceLocationProvider
import com.mapbox.common.location.IntervalSettings
import com.mapbox.common.location.LocationObserver
import com.mapbox.common.location.Location as _Location
import com.mapbox.maps.MapView
import com.mapbox.maps.plugin.PuckBearing as _PuckBearing
import com.mapbox.maps.plugin.locationcomponent.LocationComponentPlugin
import com.mapbox.maps.plugin.locationcomponent.location

import com.mapbox.common.location.LocationProvider
import com.mapbox.common.location.LocationProviderRequest
import com.mapbox.common.location.LocationService
import com.mapbox.common.location.LocationServiceFactory
import com.rnmapbox.rnmbx.utils.Logger
import kotlin.math.absoluteValue

typealias PuckBearing = _PuckBearing

const val DEFAULT_FASTEST_INTERVAL_MILLIS: Long = 1000
const val DEFAULT_INTERVAL_MILLIS: Long = 1000

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

class LocationObserverAdapter(val callback: LocationEngineCallback): LocationObserver {
  override fun onLocationUpdateReceived(locations: MutableList<com.mapbox.common.location.Location>) {
    callback.onSuccess(LocationEngineResult(locations.last()))
  }
}
class LocationEngine(var locationProvider: DeviceLocationProvider, var request: LocationProviderRequest) {
  var observers: MutableList<LocationObserverAdapter> = mutableListOf()
}


fun LocationEngine.requestLocationUpdatesV11(callback: LocationEngineCallback, looper: Looper?, minDisplacement: Float?) {
  val builder = LocationProviderRequest.Builder()
  builder.interval(intervalSettings())
  builder.accuracy(AccuracyLevel.HIGH)
  if (minDisplacement != null && minDisplacement > 0) {
    builder.displacement(minDisplacement)
  }
  val request = builder.build()
  if (! request.equals(this.request)) {
    val newProvider = LocationServiceFactory.getOrCreate().getDeviceLocationProvider(request)
    if (newProvider.isValue) {
      this.locationProvider = newProvider.value!!
      this.request = request
    } else {
      Logger.e("RNMBXLocationEngine", "Failed to get location provider: ${newProvider.error!!.message}")
    }
  }
  val observer = LocationObserverAdapter(callback)
  if (looper != null) {
    locationProvider.addLocationObserver(observer, looper)
  } else {
    locationProvider.addLocationObserver(observer)
  }
  observers.add(observer)
}

fun LocationEngine.removeLocationUpdates(callback: LocationEngineCallback) {
  observers.filter { it.callback == callback }.forEach { locationProvider.removeLocationObserver(it) }
  observers.removeAll { it.callback == callback }
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


fun intervalSettings(): IntervalSettings {
  return IntervalSettings.Builder().interval(DEFAULT_INTERVAL_MILLIS).maximumInterval(
    DEFAULT_FASTEST_INTERVAL_MILLIS).build()
}
fun createLocationEngine(context: Context): LocationEngine? {
  val locationService : LocationService = LocationServiceFactory.getOrCreate()
  var locationProvider: DeviceLocationProvider? = null
  val request = LocationProviderRequest.Builder().interval(intervalSettings()).build()
  val result = locationService.getDeviceLocationProvider(request)
  if (result.isValue) {
    locationProvider = result.value!!
    return LocationEngine(locationProvider, request)
  }
  return null
}