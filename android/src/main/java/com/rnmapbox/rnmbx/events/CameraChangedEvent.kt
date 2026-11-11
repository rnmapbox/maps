package com.rnmapbox.rnmbx.events

import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.toCameraOptions
import com.rnmapbox.rnmbx.utils.extensions.toReadableArray

/**
 * Direct event for CameraGestureObserver -> onCameraChanged
 */
class CameraChangedEvent(
    view: View?,
    private val state: WritableMap
) : AbstractEvent(view, "cameraChanged") {
    override val key: String
        get() = "onCameraChanged"

    override val payload: WritableMap
        get() = Arguments.createMap().apply { merge(state) }

    override fun toJSON(): WritableMap = payload

    override fun canCoalesce(): Boolean = true

    companion object {
        fun make(
            view: View,
            mapboxMap: MapboxMap,
            isGestureActive: Boolean,
            isUserInteraction: Boolean
        ): CameraChangedEvent {
            val camera = mapboxMap.cameraState
            val bounds = mapboxMap.coordinateBoundsForCamera(camera.toCameraOptions())
            val properties = Arguments.createMap().apply {
                putArray("center", camera.center.toReadableArray())
                putMap("bounds", Arguments.createMap().apply {
                    putArray("ne", bounds.northeast.toReadableArray())
                    putArray("sw", bounds.southwest.toReadableArray())
                })
                putDouble("zoom", camera.zoom)
                putDouble("heading", camera.bearing)
                putDouble("pitch", camera.pitch)
                putBoolean("isUserInteraction", isUserInteraction)
            }
            val state = Arguments.createMap().apply {
                putMap("properties", properties)
                putMap("gestures", Arguments.createMap().apply {
                    putBoolean("isGestureActive", isGestureActive)
                })
                putDouble("timestamp", System.currentTimeMillis().toDouble())
            }
            return CameraChangedEvent(view, state)
        }
    }
}
