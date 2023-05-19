package com.mapbox.rctmgl.events

import android.location.Location
import com.facebook.react.bridge.Arguments
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.events.constants.EventKeys
import com.mapbox.rctmgl.events.constants.EventTypes
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import java.util.*

class LocationEvent(private val location: Location, private val mapView: RCTMGLMapView?) : IEvent {
    val uUID: UUID

    init {
        uUID = UUID.randomUUID()
    }

    constructor(location: Location) : this(location, null) {}

    override val iD
        get() =  mapView?.id ?: -1

    override val key
        get() = EventKeys.USER_LOCATION_UPDATE

    override val type
        get() = EventTypes.USER_LOCATION_UPDATED

    override val timestamp
        get() =  System.currentTimeMillis()

    override fun equals(event: IEvent): Boolean {
        val other = event as LocationEvent
        return uUID == other.uUID
    }

    fun equals(event: LocationEvent): Boolean {
        return uUID == event.uUID
    }

    override val payload: WritableMap
    get() {
        val positionProperties: WritableMap = WritableNativeMap()
        val coords: WritableMap = WritableNativeMap()
        coords.putDouble("longitude", location.longitude)
        coords.putDouble("latitude", location.latitude)
        coords.putDouble("altitude", location.altitude)
        coords.putDouble("accuracy", location.accuracy.toDouble())
        // A better solution will be to pull the heading from the compass engine,
        // unfortunately the api is not publicly available in the mapbox sdk
        coords.putDouble("heading", location.bearing.toDouble())
        coords.putDouble("course", location.bearing.toDouble())
        coords.putDouble("speed", location.speed.toDouble())
        positionProperties.putMap("coords", coords)
        positionProperties.putDouble("timestamp", location.time.toDouble())
        return positionProperties
    }

    override fun toJSON(): WritableMap {
        val map = Arguments.createMap()
        map.putString("type", type)
        map.putMap("payload", payload)
        return map
    }

    override fun canCoalesce(): Boolean {
        return true
    }
}