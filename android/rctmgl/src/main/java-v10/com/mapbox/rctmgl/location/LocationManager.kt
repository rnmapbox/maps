package com.mapbox.rctmgl.location

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
//import com.mapbox.maps.plugin.locationcomponent.LocationConsumer.onLocationUpdated
//import com.mapbox.maps.plugin.locationcomponent.LocationConsumer.onBearingUpdated
import com.mapbox.android.core.location.LocationEngine
import com.mapbox.android.core.location.LocationEngineCallback
import com.mapbox.android.core.location.LocationEngineResult
import com.mapbox.maps.plugin.locationcomponent.LocationConsumer
import com.mapbox.android.core.location.LocationEngineRequest
import com.mapbox.rctmgl.location.LocationProviderForEngine
import com.mapbox.android.core.location.LocationEngineProvider
import com.mapbox.android.core.permissions.PermissionsManager
import android.os.Looper
import android.util.Log
import com.mapbox.geojson.Point
import com.mapbox.maps.plugin.locationcomponent.LocationProvider
import java.lang.Exception
import java.lang.ref.WeakReference
import java.util.ArrayList

internal class LocationProviderForEngine(var mEngine: LocationEngine?) : LocationProvider, LocationEngineCallback<LocationEngineResult> {
    var mConsumers = ArrayList<LocationConsumer>()
    fun beforeAddingFirstConsumer() {}
    fun afterRemovedLastConsumer() {}
    @SuppressLint("MissingPermission")
    override fun registerLocationConsumer(locationConsumer: LocationConsumer) {
        if (mConsumers.isEmpty()) {
            beforeAddingFirstConsumer()
        }
        mConsumers.add(locationConsumer)
        mEngine?.getLastLocation(this)
    }

    override fun unRegisterLocationConsumer(locationConsumer: LocationConsumer) {
        mConsumers.remove(locationConsumer)
        if (mConsumers.isEmpty()) {
            afterRemovedLastConsumer()
        }
    }

    fun notifyLocationUpdates(location: Location) {
        for (consumer in mConsumers) {
            val points = Point.fromLngLat(location.longitude, location.latitude)
            consumer.onLocationUpdated(points)
            val bearings = location.bearing.toDouble()
            consumer.onBearingUpdated(bearings)
        }
    }

    // * LocationEngineCallback
    override fun onSuccess(locationEngineResult: LocationEngineResult) {
        val location = locationEngineResult.lastLocation
        location?.let { notifyLocationUpdates(it) }
    }

    override fun onFailure(e: Exception) {}
}

class LocationManager private constructor(private val context: Context) : LocationEngineCallback<LocationEngineResult> {
    var engine: LocationEngine? = null
        private set
    private val listeners: MutableList<OnUserLocationChange> = ArrayList()
    private var mMinDisplacement = 0f
    private var isActive = false
    private var lastLocation: Location? = null
    private var locationEngineRequest: LocationEngineRequest? = null
    private var locationProvider: LocationProviderForEngine? = null
    val provider: LocationProvider
        get() {
            if (locationProvider == null) {
                locationProvider = LocationProviderForEngine(engine)
            }
            return locationProvider!!
        }

    interface OnUserLocationChange {
        fun onLocationChange(location: Location?)
    }

    private fun buildEngineRequest() {
        engine = LocationEngineProvider.getBestLocationEngine(context.applicationContext)
        locationEngineRequest = LocationEngineRequest.Builder(DEFAULT_INTERVAL_MILLIS)
                .setFastestInterval(DEFAULT_FASTEST_INTERVAL_MILLIS)
                .setPriority(LocationEngineRequest.PRIORITY_HIGH_ACCURACY)
                .setDisplacement(mMinDisplacement)
                .build()
    }

    fun addLocationListener(listener: OnUserLocationChange) {
        if (!listeners.contains(listener)) {
            listeners.add(listener)
        }
    }

    fun removeLocationListener(listener: OnUserLocationChange) {
        if (listeners.contains(listener)) {
            listeners.remove(listener)
        }
    }

    fun setMinDisplacement(minDisplacement: Float) {
        mMinDisplacement = minDisplacement
    }

    @SuppressLint("MissingPermission")
    fun enable() {
        if (!PermissionsManager.areLocationPermissionsGranted(context)) {
            return
        }

        // remove existing listeners
        engine?.removeLocationUpdates(this)

        // refresh location engine request with new values
        buildEngineRequest()

        // add new listeners
        engine?.requestLocationUpdates(
                locationEngineRequest!!,
                this,
                Looper.getMainLooper()
        )
        isActive = true
    }

    fun disable() {
        engine?.removeLocationUpdates(this)
        isActive = false
    }

    fun dispose() {
        if (engine == null) {
            return
        }
        disable()
        engine?.removeLocationUpdates(this)
    }

    fun isActive(): Boolean {
        return engine != null && isActive
    }

    val lastKnownLocation: Location?
        get() = if (engine == null) {
            null
        } else lastLocation

    @SuppressLint("MissingPermission")
    fun getLastKnownLocation(callback: LocationEngineCallback<LocationEngineResult?>) {
        if (engine == null) {
            callback.onFailure(Exception("LocationEngine not initialized"))
        }
        try {
            engine?.getLastLocation(callback)
        } catch (exception: Exception) {
            Log.w(LOG_TAG, exception)
            callback.onFailure(exception)
        }
    }

    fun onLocationChanged(location: Location?) {
        lastLocation = location
        for (listener in listeners) {
            listener.onLocationChange(location)
        }
    }

    override fun onFailure(exception: Exception) {
        // FMTODO handle this.
    }

    override fun onSuccess(result: LocationEngineResult) {
        onLocationChanged(result.lastLocation)
        if (locationProvider != null) {
            locationProvider!!.onSuccess(result)
        }
    }

    companion object {
        const val DEFAULT_FASTEST_INTERVAL_MILLIS: Long = 1000
        const val DEFAULT_INTERVAL_MILLIS: Long = 1000
        const val LOG_TAG = "LocationManager"
        private var INSTANCE: WeakReference<LocationManager>? = null
        @JvmStatic
        fun getInstance(context: Context): LocationManager? {
            if (INSTANCE == null) {
                INSTANCE = WeakReference(LocationManager(context))
            }
            return INSTANCE!!.get()
        }
    }

    init {
        buildEngineRequest()
    }
}