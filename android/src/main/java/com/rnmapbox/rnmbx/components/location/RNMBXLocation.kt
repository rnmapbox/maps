/***
to: android/src/main/java/com/rnmapbox/rnmbx/components/location/RNMBXLocation.kt
***/
package com.rnmapbox.rnmbx.components.location

import android.animation.ValueAnimator
import android.content.Context
import android.util.Log
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.facebook.react.views.view.ReactViewGroup
import com.mapbox.common.location.LocationError
import com.mapbox.geojson.Point
import com.mapbox.maps.MapView
import com.mapbox.maps.plugin.locationcomponent.DefaultLocationProvider
import com.mapbox.maps.plugin.locationcomponent.LocationComponentPlugin
import com.mapbox.maps.plugin.locationcomponent.location
import com.rnmapbox.rnmbx.v11compat.location.LocationConsumer
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.events.BaseEvent
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.events.constants.EventKeys
import com.rnmapbox.rnmbx.utils.PropertyChanges
import com.rnmapbox.rnmbx.utils.PropertyUpdaterWithName
import com.rnmapbox.rnmbx.utils.writableArrayOf
import com.rnmapbox.rnmbx.utils.writableMapOf

class RNMBXLocation(private val context: Context, private val manager: RNMBXLocationManager) :
AbstractMapFeature(
    context
) {
    enum class Property(val _apply: (RNMBXLocation) -> Unit) :
        PropertyUpdaterWithName<RNMBXLocation> {
            ON_LOCATION_OR_BEARING_CHANGE(RNMBXLocation::applyLocationConsumer),;

        override fun apply(location: RNMBXLocation) {
            _apply(location)
        }
    }

    val changes = PropertyChanges<RNMBXLocation>();

    private var locationConsumer: LocationConsumer? = null

    var hasOnBearingChange: Boolean = false
        set(value) {
            field = value
            changes.add(Property.ON_LOCATION_OR_BEARING_CHANGE)
        }

    var hasOnLocationChange: Boolean = false
        set(value) {
            field = value
            changes.add(Property.ON_LOCATION_OR_BEARING_CHANGE)
        }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        changes.apply(this)
    }

    private fun withLocation(callback: (mapView: MapView, location: LocationComponentPlugin, locationProviderManager: LocationProviderManager) -> Unit) {
        withMapView { mapView ->
            callback(mapView.mapView, mapView.mapView.location, mapView.locationProviderManager)
        }
    }

    private fun createLocationConsumer() = object: LocationConsumer {
        override fun onBearingUpdated(
            vararg bearing: Double,
            options: (ValueAnimator.() -> Unit)?
        ) {
            if (hasOnBearingChange) {
                manager.dispatchEvent(
                    BaseEvent(
                        UIManagerHelper.getSurfaceId(context),
                        id,
                        EventKeys.LOCATION_ON_BEARING_CHANGE.value,
                        writableMapOf(
                            "bearing" to writableArrayOf( bearing.map { it })
                        )
                    )
                )
                Log.e("RNMBXLocation", "onBearingUpdated:${bearing} ${options}")
            }
        }

        override fun onError(error: LocationError) {
            Log.e("RNMBXLocation", "onError:${error}")
        }

        override fun onHorizontalAccuracyRadiusUpdated(
            vararg radius: Double,
            options: (ValueAnimator.() -> Unit)?
        ) {
            Log.e("RNMBXLocation", "onHorizontalAccuracyRadiusUpdated:${radius} ${options}")
        }

        override fun onLocationUpdated(
            vararg location: Point,
            options: (ValueAnimator.() -> Unit)?
        ) {

            if (hasOnLocationChange) {
                manager.dispatchEvent(
                    BaseEvent(
                        UIManagerHelper.getSurfaceId(context),
                        id,
                        EventKeys.LOCATION_ON_LOCATION_CHANGE.value,
                        writableMapOf(
                            "locations" to writableArrayOf(
                                *location.map { writableMapOf(
                                    "longitude" to it.longitude(),
                                    "latitude" to it.latitude(),
                                    *(if(it.hasAltitude()) arrayOf("altitude" to it.altitude()) else arrayOf())
                                ) }.toTypedArray()
                            )
                        )
                    )
                )
            }
        }

        override fun onPuckAccuracyRadiusAnimatorDefaultOptionsUpdated(options: ValueAnimator.() -> Unit) {
            Log.e("RNMBXLocation", "onPuckAccuracyRadiusAnimatorDefaultOptionsUpdated:${options}")
        }

        override fun onPuckBearingAnimatorDefaultOptionsUpdated(options: ValueAnimator.() -> Unit) {
            Log.e("RNMBXLocation", "onPuckBearingAnimatorDefaultOptionsUpdated:${options}")

        }

        override fun onPuckLocationAnimatorDefaultOptionsUpdated(options: ValueAnimator.() -> Unit) {
            Log.e("RNMBXLocation", "onPuckLocationAnimatorDefaultOptionsUpdated:${options}")
        }
    }

    private fun subscribeForLocationUpdates() {
        withLocation { mapView, _, locationProviderManager ->
            if (this.locationConsumer != null) {
                return@withLocation
            }

            val locationConsumer = createLocationConsumer();
            locationProviderManager.getLocationProvider(mapView)?.registerLocationConsumer(locationConsumer)
            this.locationConsumer = locationConsumer

            locationProviderManager.onChange { old, new ->
                val locationConsumer = this.locationConsumer
                if (locationConsumer != null) {
                    old.unRegisterLocationConsumer(locationConsumer)
                    new.registerLocationConsumer(locationConsumer)
                }
            }
        }
    }

    private fun applyLocationConsumer() {
        withLocation { mapView, location, locationProviderManager ->
            if (hasOnLocationChange || hasOnBearingChange) {
                val locationConsumer = createLocationConsumer()
                locationProviderManager.getLocationProvider(mapView).registerLocationConsumer(locationConsumer)
                this.locationConsumer = locationConsumer
            } else {
                val locationConsumer = this.locationConsumer
                if (locationConsumer != null) {
                    this.locationConsumer = null;
                    locationProviderManager.getLocationProvider(mapView).unRegisterLocationConsumer(locationConsumer)
                }
            }
        }
    }
}