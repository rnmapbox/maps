package com.rnmapbox.rnmbx.events

import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.mapbox.maps.CameraChanged
import com.mapbox.maps.CameraState
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.toCameraOptions
import com.rnmapbox.rnmbx.components.mapview.helpers.CameraChangeReason

/**
 * Direct event for CameraGestureObserver -> onCameraChange
 * JS registrationName: onCameraChange
 * Native event name (key): onCameraChange
 *
 * Serializes the camera snapshot into the JS `OnCameraChangeEvent` shape:
 * `{ properties: { center, bounds:{ne,sw}, zoom, heading, pitch }, gestures: { isGestureActive }, timestamp }`.
 *
 * [center], [ne] and [sw] are `[longitude, latitude]` pairs. [ne]/[sw] may be `null` if the
 * bounds could not be computed for the current camera.
 */
class MapCameraChangeEvent(
    view: View?,
    private val center: List<Double>,
    private val ne: List<Double>?,
    private val sw: List<Double>?,
    private val zoom: Double,
    private val heading: Double,
    private val pitch: Double,
    private val isUserInteraction: Boolean,
) : AbstractEvent(view, "mapCameraChange") {
    override val key: String
        get() = "onMapCameraChange"

    override val payload: WritableMap
        get() = Arguments.createMap().apply {
            putMap("properties", Arguments.createMap().apply {
                putArray("center", center.toWritableArray())
                putMap("bounds", Arguments.createMap().apply {
                    if (ne != null) putArray("ne", ne.toWritableArray()) else putNull("ne")
                    if (sw != null) putArray("sw", sw.toWritableArray()) else putNull("sw")
                })
                putDouble("zoom", zoom)
                putDouble("heading", heading)
                putDouble("pitch", pitch)
            })
            putBoolean("isUserInteraction", isUserInteraction)
            putDouble("timestamp", timestamp.toDouble())
        }

    override fun toJSON(): WritableMap {
        val map = Arguments.createMap()
        map.merge(payload)
        return map
    }

    override fun canCoalesce(): Boolean {
        // Coalesce rapid camera changes - only the latest snapshot is relevant
        return true
    }

    companion object {
        fun make(
            view: View,
            center: List<Double>,
            ne: List<Double>?,
            sw: List<Double>?,
            zoom: Double,
            heading: Double,
            pitch: Double,
            isUserInteraction: Boolean
        ): MapCameraChangeEvent = MapCameraChangeEvent(
            view, center, ne, sw, zoom, heading, pitch, isUserInteraction
        )

        fun make(
            view: View,
            mapboxMap: MapboxMap,
            cameraChanged: CameraChanged,
            reason: CameraChangeReason
        ): MapCameraChangeEvent {
            val cameraState: CameraState = cameraChanged.cameraState
            val center = cameraState.center
            val bounds = runCatching {
                mapboxMap.coordinateBoundsForCamera(cameraState.toCameraOptions())
            }.getOrNull()

            return make(
                view,
                center = listOf(center.longitude(), center.latitude()),
                ne = bounds?.northeast?.let { listOf(it.longitude(), it.latitude()) },
                sw = bounds?.southwest?.let { listOf(it.longitude(), it.latitude()) },
                zoom = cameraState.zoom,
                heading = cameraState.bearing,
                pitch = cameraState.pitch,
                isUserInteraction = reason == CameraChangeReason.USER_GESTURE
            )
        }

        private fun List<Double>.toWritableArray(): WritableArray =
            Arguments.createArray().also { array -> forEach { array.pushDouble(it) } }
    }
}
