package com.mapbox.rctmgl.location

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import com.mapbox.android.core.location.LocationEngine
import com.mapbox.android.core.location.LocationEngineCallback
import com.mapbox.android.core.location.LocationEngineResult
import com.mapbox.maps.plugin.locationcomponent.LocationConsumer
import com.mapbox.android.core.location.LocationEngineRequest
import com.mapbox.android.core.location.LocationEngineProvider
import com.mapbox.android.core.permissions.PermissionsManager
import android.os.Looper
import android.util.Log
import com.mapbox.geojson.Point
import com.mapbox.maps.plugin.locationcomponent.LocationProvider
import java.lang.ref.WeakReference
import java.util.ArrayList
import kotlin.Exception

internal class LocationProviderForEngine(var mEngine: LocationEngine?, val context: Context) : LocationProvider, LocationEngineCallback<LocationEngineResult> {
    var mConsumers = ArrayList<LocationConsumer>()
    @SuppressLint("MissingPermission")
    fun beforeAddingFirstConsumer() {
        val request = LocationEngineRequest.Builder(LocationManager.DEFAULT_INTERVAL_MILLIS
        )
            .setFastestInterval(LocationManager.DEFAULT_FASTEST_INTERVAL_MILLIS)
            .setPriority(LocationEngineRequest.PRIORITY_HIGH_ACCURACY)
            .build();

        if (!PermissionsManager.areLocationPermissionsGranted(context)) {
            return
        }

        mEngine?.requestLocationUpdates(
          request,
          this,
          Looper.getMainLooper()
        )

    }
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
    override fun onSuccess(locationEngineResult: LocationEngineResult?) {
        val location = locationEngineResult?.lastLocation
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
    private var locationProvider: LocationProvider? = null
    private var nStarts : Int = 0
    private var isPaused : Boolean = false

    var provider: LocationProvider
        get() {
            var ret = locationProvider
            if (ret == null) {
                val engine = LocationProviderForEngine(engine, context)
                locationProvider = engine
                return engine
            } else {
                return ret
            }
        }
        set(value) {
            locationProvider = value
        }

    interface OnUserLocationChange {
        fun onLocationChange(location: Location?)
    }

    /// public interface

    fun startCounted() {
        nStarts += 1;
        if (nStarts == 1) {
            enable(false);
        }
    }

    fun stopCounted() {
        nStarts -= 1;
        if (nStarts == 0) {
            dispose();
        }
    }

    fun pause() {
        isPaused = true
    }

    fun resume() {
        isPaused = false
        if (nStarts > 0) {
            enable(false)
        }
    }

    fun destroy() {
        dispose();
        nStarts = -1000;
    }

    ////

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

        if (isActive) {
            enable(true)
        }
    }

    @SuppressLint("MissingPermission")
    private fun enable(refresh: Boolean) {
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

    private fun disable() {
        engine?.removeLocationUpdates(this)
        isActive = false
    }

    private fun dispose() {
        if (engine == null) {
            return
        }
        disable()
    }

    fun isActive(): Boolean {
        return engine != null && isActive
    }

    val lastKnownLocation: Location?
        get() = if (engine == null) {
            null
        } else lastLocation

    @SuppressLint("MissingPermission")
    fun getLastKnownLocation(callback: LocationEngineCallback<LocationEngineResult>) {
        if (engine == null) {
            callback.onFailure(Exception("LocationEngine not initialized"))
        }
        try {
            engine?.getLastLocation(object : LocationEngineCallback<LocationEngineResult> {
                override fun onSuccess(result: LocationEngineResult?) {
                    if (result == null) {
                        callback.onFailure( NullPointerException("LocationEngineResult is null"))
                    } else {
                        callback.onSuccess(result)
                    }
                }

                override fun onFailure(exception: Exception) {
                    callback.onFailure(exception)
                }
            })
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

    override fun onSuccess(result: LocationEngineResult?) {
        onLocationChanged(result?.lastLocation)
        val provider = locationProvider
        if (provider != null && provider is LocationProviderForEngine) {
            provider.onSuccess(result)
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