package com.rnmapbox.rnmbx.components.location

import android.content.Context
import com.mapbox.geojson.Point
import com.mapbox.maps.MapView
import com.mapbox.maps.plugin.locationcomponent.DefaultLocationProvider
import com.mapbox.maps.plugin.locationcomponent.LocationConsumer
import com.mapbox.maps.plugin.locationcomponent.LocationProvider
import com.mapbox.maps.plugin.locationcomponent.location
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.utils.PropertyChanges
import com.rnmapbox.rnmbx.utils.PropertyUpdaterWithName

class RNMBXCustomLocationProvider(context: Context) : AbstractMapFeature(context) {
    val changes = PropertyChanges<RNMBXCustomLocationProvider>()

    enum class Property(val _apply: (RNMBXCustomLocationProvider) -> Unit) :
        PropertyUpdaterWithName<RNMBXCustomLocationProvider> {
        COORDINATE(RNMBXCustomLocationProvider::applyCoordinate),
        HEADING(RNMBXCustomLocationProvider::applyHeading);

        override fun apply(locationProvider: RNMBXCustomLocationProvider) {
            _apply(locationProvider)
        }
    }

    var coordinate: Pair<Double, Double>? = null
        set(value) {
            field = value;
            changes.add(Property.COORDINATE)
        }

    var heading: Double? = null
        set(value) {
            field = value
            changes.add(Property.HEADING)
        }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        installCustomLocationProviderIfNeeded(mapView.mapView)
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        removeCustomLocationProvider(mapView.mapView)
        return super.removeFromMap(mapView, reason)
    }

    fun applyCoordinate() {
        coordinate?.let {
            updateCorodinate(it.second, it.first)
        }
    }

    fun applyHeading() {
        heading?.let {
            updateHeading(it)
        }
    }

    fun applyAllChanges() {
        changes.apply(this)
    }

    fun updateCorodinate(latitude: Double, longitude: Double) {
        val point = Point.fromLngLat(longitude, latitude)
        locationConsumers.forEach {
            it.onLocationUpdated(point)
        }
    }

    fun updateHeading(heading: Double) {
        locationConsumers.forEach {
            it.onBearingUpdated(heading)
        }
    }

    // region Location Provider
    private var locationConsumers = mutableListOf<LocationConsumer>()
    private var customLocationProvider: LocationProvider? = null
    private var defaultLocationProvider: LocationProvider? = null

    fun installCustomLocationProviderIfNeeded(mapView: MapView) {
        var customLocationProvider: LocationProvider? = null
        if (customLocationProvider == null) {
            customLocationProvider = object : LocationProvider {
                override fun registerLocationConsumer(locationConsumer: LocationConsumer) {
                    locationConsumers.add(locationConsumer)
                }

                override fun unRegisterLocationConsumer(locationConsumer: LocationConsumer) {
                    locationConsumers.remove(locationConsumer)
                }
            }
        }
        if (customLocationProvider != null) {
            defaultLocationProvider = mapView.location.getLocationProvider()
            mapView.location.setLocationProvider(customLocationProvider)
            this.customLocationProvider = customLocationProvider
        }
    }

    fun removeCustomLocationProvider(mapView: MapView) {
        mapView.location.setLocationProvider(
            defaultLocationProvider ?: DefaultLocationProvider(
                context
            )
        )
        customLocationProvider = null
    }
    // endregion
}
