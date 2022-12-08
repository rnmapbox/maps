package com.mapbox.rctmgl.modules

import android.location.Location
import com.facebook.react.bridge.*
import com.mapbox.rctmgl.location.LocationManager
import com.facebook.react.module.annotations.ReactModule
import com.mapbox.rctmgl.location.LocationManager.OnUserLocationChange
import com.mapbox.rctmgl.events.LocationEvent
import com.mapbox.android.core.location.LocationEngineCallback
import com.mapbox.android.core.location.LocationEngineResult
import com.mapbox.rctmgl.events.EventEmitter
import com.mapbox.rctmgl.location.LocationManager.Companion.getInstance
import java.lang.Exception

@ReactModule(name = RCTMGLLocationModule.REACT_CLASS)
class RCTMGLLocationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    private var isEnabled = false
    private var mMinDisplacement = 0f
    private val locationManager: LocationManager? = getInstance(reactContext)
    private var mLastLocation: Location? = null

    private val lifecycleEventListener: LifecycleEventListener = object : LifecycleEventListener {
        override fun onHostResume() {
            if (isEnabled) {
                locationManager?.resume()
            }
        }

        override fun onHostPause() {
            locationManager?.pause()
        }

        override fun onHostDestroy() {
            locationManager?.destroy()
        }
    }

    private val onUserLocationChangeCallback: OnUserLocationChange = object : OnUserLocationChange {
        override fun onLocationChange(location: Location?) {
            var changed = (mLastLocation != null) != (location != null)
            val lastLocation = mLastLocation
            if (lastLocation != null && location != null) {
                if (
                    lastLocation.latitude != location.latitude ||
                    lastLocation.longitude != location.longitude ||
                    lastLocation.altitude != location.altitude ||
                    lastLocation.accuracy != location.accuracy ||
                    lastLocation.bearing != location.bearing
                ) {
                    changed = true
                }
            }
            mLastLocation = location
            if (changed && (location != null)) {
                val locationEvent = LocationEvent(location)
                val emitter = EventEmitter.getModuleEmitter(reactApplicationContext)
                emitter?.emit(LOCATION_UPDATE, locationEvent.payload)
            }
        }
    }

    init {
        reactContext.addLifecycleEventListener(lifecycleEventListener)
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    @ReactMethod
    fun start(minDisplacement: Float) {
        isEnabled = true
        mMinDisplacement = minDisplacement
        locationManager?.startCounted()
        startLocationManager()
    }

    @ReactMethod
    fun setMinDisplacement(minDisplacement: Float) {
        if (mMinDisplacement == minDisplacement) return
        mMinDisplacement = minDisplacement
        if (isEnabled) {

            // set minimal displacement in the manager
            locationManager!!.setMinDisplacement(mMinDisplacement)
        }
    }

    @ReactMethod
    fun stop() {
        stopLocationManager()
    }

    @ReactMethod
    fun getLastKnownLocation(promise: Promise) {
        locationManager!!.getLastKnownLocation(
            object : LocationEngineCallback<LocationEngineResult> {
                override fun onSuccess(result: LocationEngineResult) {
                    val location = result.lastLocation
                    if (location != null) {
                        val locationEvent = LocationEvent(location)
                        promise.resolve(locationEvent.payload)
                    } else {
                        promise.resolve(null)
                    }
                }

                override fun onFailure(exception: Exception) {
                    promise.reject(exception)
                }
            }
        )
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Required for rn built in EventEmitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Required for rn built in EventEmitter Calls.
    }

    private fun startLocationManager() {
        mLastLocation = null;
        locationManager!!.addLocationListener(onUserLocationChangeCallback)
        locationManager.setMinDisplacement(mMinDisplacement)
        locationManager.startCounted()
    }

    private fun stopLocationManager() {
        if (!isEnabled) {
            return
        }
        locationManager!!.removeLocationListener(onUserLocationChangeCallback)
        locationManager.stopCounted()
        isEnabled = false
        mLastLocation = null
    }

    companion object {
        const val REACT_CLASS = "RCTMGLLocationModule"
        const val LOCATION_UPDATE = "MapboxUserLocationUpdate"
    }
}