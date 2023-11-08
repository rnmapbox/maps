package com.rnmapbox.rnmbx.location

import android.annotation.SuppressLint
import android.content.Context
import com.mapbox.maps.plugin.locationcomponent.LocationConsumer
import com.mapbox.android.core.permissions.PermissionsManager
import android.os.Looper
import android.util.Log
import com.mapbox.geojson.Point
import com.mapbox.maps.plugin.locationcomponent.LocationProvider
import java.lang.ref.WeakReference
import java.util.ArrayList
import kotlin.Exception

import com.rnmapbox.rnmbx.v11compat.location.*


open class SingletonHolder<out T, in A>(creator: (A) -> T) {
    private var creator: ((A) -> T)? = creator
    @Volatile private var instance: T? = null

    fun getInstance(arg: A): T {
        val i = instance
        if (i != null) {
            return i
        }

        return synchronized(this) {
            val i2 = instance
            if (i2 != null) {
                i2
            } else {
                val created = creator!!(arg)
                instance = created
                creator = null
                created
            }
        }
    }
}

internal class LocationProviderForEngine(var mEngine: LocationEngine?, val context: Context) : LocationProvider, LocationEngineCallback {
    var mConsumers = ArrayList<LocationConsumer>()
    @SuppressLint("MissingPermission")
    fun beforeAddingFirstConsumer() {
        if (!PermissionsManager.areLocationPermissionsGranted(context)) {
            return
        }

        mEngine?.requestLocationUpdatesV11(
          this,
          Looper.getMainLooper(),
            null
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
            location.bearing?.toDouble()?.also {
                consumer.onBearingUpdated(it)
            }
        }
    }

    // * LocationEngineCallback
    override fun onSuccess(locationEngineResult: LocationEngineResult) {
        val location = locationEngineResult?.lastLocation
        location?.let { notifyLocationUpdates(it) }
    }

    override fun onFailure(e: Exception) {}
}

class LocationManager private constructor(private val context: Context) : LocationEngineCallback {
    var engine: LocationEngine? = null
        private set
    private val listeners: MutableList<OnUserLocationChange> = ArrayList()
    private var mMinDisplacement = 0f
    private var isActive = false
    private var lastLocation: Location? = null
    // private var locationEngineRequest: LocationEngineRequest? = null
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
        engine = createLocationEngine(context.applicationContext)
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

        // add new listeners
        engine?.requestLocationUpdatesV11(
            this,
            Looper.getMainLooper(),
            mMinDisplacement
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
    fun getLastKnownLocation(callback: LocationEngineCallback) {
        if (engine == null) {
            callback.onFailure(Exception("LocationEngine not initialized"))
        }
        try {
            engine?.getLastLocation(object : LocationEngineCallback {
                override fun onSuccess(result: LocationEngineResult) {
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

    override fun onSuccess(result: LocationEngineResult) {
        onLocationChanged(result?.lastLocation)
        val provider = locationProvider
        if (provider != null && provider is LocationProviderForEngine) {
            provider.onSuccess(result)
        }
    }

    companion object : SingletonHolder<LocationManager, Context>(::LocationManager) {
        const val DEFAULT_FASTEST_INTERVAL_MILLIS: Long = 1000
        const val DEFAULT_INTERVAL_MILLIS: Long = 1000
        const val LOG_TAG = "LocationManager"

    }

    init {
        buildEngineRequest()
    }
}