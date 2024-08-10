package com.rnmapbox.rnmbx.components.location

import com.rnmapbox.rnmbx.v11compat.Cancelable
import com.mapbox.maps.MapView
import com.mapbox.maps.plugin.locationcomponent.DefaultLocationProvider
import com.mapbox.maps.plugin.locationcomponent.LocationProvider
import com.mapbox.maps.plugin.locationcomponent.location
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import java.lang.ref.WeakReference

typealias CallbackType = (old: LocationProvider, new: LocationProvider) -> Unit;


class CallbackList<T> {
    class Entry<T>(val callback: T, val list: WeakReference<CallbackList<T>>): Cancelable {

        override fun cancel() {
            list.get()?.remove(this)
        }
    }
    private val callbacks = mutableListOf<Entry<T>>()

    fun add(callback: T): Cancelable {
        val result = Entry<T>(callback, WeakReference(this));
        callbacks.add(result)
        return result;
    }

    internal fun remove(entry: Entry<T>) {
        callbacks.remove(entry)
    }

    fun forEach(callback: (it: T) -> Unit) {
        callbacks.map { it.callback }.forEach(callback)
    }
}


class LocationProviderManager(val mapView: RNMBXMapView) {
    var callbacks = CallbackList<CallbackType>()

    fun getLocationProvider(mapView: MapView): LocationProvider {
        val location = mapView.location
        val result = location.getLocationProvider()

        if (result != null) {
            return result
        } else {
            val result = DefaultLocationProvider(mapView.context)
            location.setLocationProvider(result)
            return result
        }
    }

    fun update(provider: LocationProvider) {
        mapView.withMapView { mapView: MapView ->
            val location = mapView.location
            val oldProvider = location.getLocationProvider()
            location.setLocationProvider(provider)

            if (oldProvider != null) {
                apply(oldProvider, provider)
            }
        }
    }

    fun onChange(callback: CallbackType): Cancelable =
        callbacks.add(callback)

    fun apply(old: LocationProvider, new: LocationProvider) {
        callbacks.forEach { it(old, new) }
    }
}