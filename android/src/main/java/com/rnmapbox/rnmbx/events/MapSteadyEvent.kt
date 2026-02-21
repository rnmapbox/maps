package com.rnmapbox.rnmbx.events

import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

/**
 * Direct event for CameraGestureObserver -> onMapSteady
 * JS registrationName: onMapSteady
 * Native event name (key): onMapSteady
 */
class MapSteadyEvent(
    view: View?,
    private val reason: String,
    private val idleDurationMs: Double?,
    private val lastGestureType: String?
) : AbstractEvent(view, "mapSteady") {
    override val key: String
        get() = "onMapSteady"

    override val payload: WritableMap
        get() = Arguments.createMap().apply {
            putString("reason", reason)
            if (idleDurationMs != null) {
                putDouble("idleDurationMs", idleDurationMs)
            } else {
                putNull("idleDurationMs")
            }
            if (lastGestureType != null) {
                putString("lastGestureType", lastGestureType)
            } else {
                putNull("lastGestureType")
            }
            putDouble("timestamp", System.currentTimeMillis().toDouble())
        }

    override fun canCoalesce(): Boolean {
        // Do not coalesce - each steady/timeout event is significant
        return false
    }

    companion object {
        fun make(
            view: View,
            reason: String,
            idleDurationMs: Double?,
            lastGestureType: String?
        ): MapSteadyEvent = MapSteadyEvent(view, reason, idleDurationMs, lastGestureType)
    }
}
