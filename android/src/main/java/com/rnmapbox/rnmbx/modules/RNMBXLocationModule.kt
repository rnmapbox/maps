package com.rnmapbox.rnmbx.modules

import com.facebook.react.bridge.*
import com.rnmapbox.rnmbx.location.LocationManager
import com.facebook.react.module.annotations.ReactModule
import com.rnmapbox.rnmbx.NativeRNMBXLocationModuleSpec
import com.rnmapbox.rnmbx.location.LocationManager.OnUserLocationChange
import com.rnmapbox.rnmbx.events.LocationEvent
import com.rnmapbox.rnmbx.events.EventEmitter
import com.rnmapbox.rnmbx.location.LocationManager.Companion.getInstance
import java.lang.Exception

import com.rnmapbox.rnmbx.v11compat.location.*

data class LocationEventThrottle(var waitBetweenEvents: Double? = null, var lastSentTimestamp: Long? = null) {
}

@ReactModule(name = RNMBXLocationModule.REACT_CLASS)
class RNMBXLocationModule(reactContext: ReactApplicationContext) :
    NativeRNMBXLocationModuleSpec(reactContext) {
    private var isEnabled = false
    private var mMinDisplacement = 0f
    private val locationManager: LocationManager? = getInstance(reactContext)
    private var mLastLocation: Location? = null
    private var locationEventThrottle: LocationEventThrottle = LocationEventThrottle()

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
            if (changed && (location != null) && shouldSendLocationEvent()) {
                val locationEvent = LocationEvent(location)

                emitOnLocationUpdate(locationEvent.toJSON())
                /*
                val emitter = EventEmitter.getModuleEmitter(reactApplicationContext)
                emitter?.emit(LOCATION_UPDATE, locationEvent.payload)
                */
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
    override fun start(minDisplacement: Double) {
        isEnabled = true
        mMinDisplacement = minDisplacement.toFloat()
        locationManager?.startCounted()
        startLocationManager()
    }

    @ReactMethod
    override fun setMinDisplacement(value: Double) {
        val minDisplacement = value.toFloat()
        if (mMinDisplacement == minDisplacement) return
        mMinDisplacement = minDisplacement
        if (isEnabled) {

            // set minimal displacement in the manager
            locationManager!!.setMinDisplacement(mMinDisplacement)
        }
    }

    @ReactMethod
    override fun setRequestsAlwaysUse(requestsAlwaysUse: Boolean) {
        // IOS only. Ignored on Android.
    }

    @ReactMethod
    override fun stop() {
        stopLocationManager()
    }

    @ReactMethod
    override fun getLastKnownLocation(promise: Promise) {
        locationManager!!.getLastKnownLocation(
            object : LocationEngineCallback {
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

    override fun simulateHeading(changesPerSecond: Double, increment: Double) {
        // ios only
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

    // region Location event throttle
    @ReactMethod
    override fun setLocationEventThrottle(throttleValue: Double) {
        if (throttleValue > 0) {
            locationEventThrottle.waitBetweenEvents = throttleValue;
        } else {

            locationEventThrottle.waitBetweenEvents = null
        }
    }

    fun shouldSendLocationEvent(): Boolean {
        val waitBetweenEvents = locationEventThrottle.waitBetweenEvents
        if (waitBetweenEvents == null) {
            return true
        }

        val currentTimestamp = System.nanoTime()
        val lastSentTimestamp = locationEventThrottle.lastSentTimestamp
        if (lastSentTimestamp == null) {
            return true
        }

        if ((currentTimestamp - lastSentTimestamp) > 1000.0*waitBetweenEvents) {
            return true
        }

        return false
    }
    // endregion


    companion object {
        const val REACT_CLASS = "RNMBXLocationModule"
        const val LOCATION_UPDATE = "MapboxUserLocationUpdate"
    }
}
