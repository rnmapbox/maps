package com.rnmapbox.rnmbx.modules

import android.animation.ValueAnimator
import com.facebook.react.bridge.*
import com.rnmapbox.rnmbx.location.LocationManager
import com.facebook.react.module.annotations.ReactModule
import com.rnmapbox.rnmbx.NativeRNMBXLocationModuleSpec
import com.rnmapbox.rnmbx.location.LocationManager.OnUserLocationChange
import com.rnmapbox.rnmbx.events.LocationEvent
import com.rnmapbox.rnmbx.location.LocationManager.Companion.getInstance
import com.mapbox.common.location.LocationError
import com.mapbox.geojson.Point
import com.mapbox.maps.plugin.locationcomponent.DefaultLocationProvider
import com.mapbox.maps.plugin.locationcomponent.LocationConsumer
import java.lang.Exception
import kotlin.math.abs

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
    private var mLastHeading: Double? = null
    private var mLastSentHeading: Double? = null
    private var headingProvider: DefaultLocationProvider? = null

    private val lifecycleEventListener: LifecycleEventListener = object : LifecycleEventListener {
        override fun onHostResume() {
            if (isEnabled) {
                locationManager?.resume()
                startHeadingUpdates()
            }
        }

        override fun onHostPause() {
            locationManager?.pause()
            stopHeadingUpdates()
        }

        override fun onHostDestroy() {}
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
                sendLocationEvent(location)
            }
        }
    }

    private val headingConsumer = object : LocationConsumer {
        override fun onBearingUpdated(vararg bearing: Double, options: (ValueAnimator.() -> Unit)?) {
            val heading = bearing.lastOrNull()?.let { (it % 360.0 + 360.0) % 360.0 } ?: return
            mLastHeading = heading
            val location = mLastLocation ?: return
            // Like CLLocationManager's default headingFilter, ignore changes under 1 degree
            val lastSent = mLastSentHeading
            if (lastSent != null && abs((heading - lastSent + 540.0) % 360.0 - 180.0) < 1.0) return
            if (shouldSendLocationEvent()) {
                sendLocationEvent(location)
            }
        }

        override fun onLocationUpdated(vararg location: Point, options: (ValueAnimator.() -> Unit)?) {}
        override fun onPuckLocationAnimatorDefaultOptionsUpdated(options: ValueAnimator.() -> Unit) {}
        override fun onPuckBearingAnimatorDefaultOptionsUpdated(options: ValueAnimator.() -> Unit) {}
        override fun onHorizontalAccuracyRadiusUpdated(vararg radius: Double, options: (ValueAnimator.() -> Unit)?) {}
        override fun onPuckAccuracyRadiusAnimatorDefaultOptionsUpdated(options: ValueAnimator.() -> Unit) {}
        override fun onError(error: LocationError) {}
    }

    private fun sendLocationEvent(location: Location) {
        mLastSentHeading = mLastHeading
        emitOnLocationUpdate(LocationEvent(location, mLastHeading).toJSON())
    }

    private fun startHeadingUpdates() {
        if (headingProvider != null) return
        headingProvider = DefaultLocationProvider(reactApplicationContext).also {
            it.updatePuckBearing(PuckBearing.HEADING)
            it.registerLocationConsumer(headingConsumer)
        }
    }

    private fun stopHeadingUpdates() {
        headingProvider?.unRegisterLocationConsumer(headingConsumer)
        headingProvider = null
    }

    init {
        reactContext.addLifecycleEventListener(lifecycleEventListener)
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun invalidate() {
        reactApplicationContext.removeLifecycleEventListener(lifecycleEventListener)
        stopLocationManager()
        super.invalidate()
    }

    @ReactMethod
    override fun start(minDisplacement: Double) {
        mMinDisplacement = minDisplacement.toFloat()
        if (isEnabled) return
        isEnabled = true
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
                        val locationEvent = LocationEvent(location, mLastHeading)
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
        startHeadingUpdates()
    }

    private fun stopLocationManager() {
        if (!isEnabled) {
            return
        }
        locationManager!!.removeLocationListener(onUserLocationChangeCallback)
        locationManager.stopCounted()
        stopHeadingUpdates()
        isEnabled = false
        mLastLocation = null
        mLastHeading = null
        mLastSentHeading = null
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
