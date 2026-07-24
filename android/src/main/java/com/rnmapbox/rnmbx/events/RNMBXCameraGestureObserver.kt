package com.rnmapbox.rnmbx.events

import android.content.Context
import android.util.Log
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.MapGestureType
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.components.mapview.helpers.MapSteadyDetector

class RNMBXCameraGestureObserver(
    private val mContext: Context,
    private val mManager: RNMBXCameraGestureObserverManager
) : AbstractMapFeature(mContext) {

    var hasOnMapSteady: Boolean = false
    var quietPeriodMs: Double? = null
    var maxIntervalMs: Double? = null

    override var requiresStyleLoad: Boolean = false

    private var detector: MapSteadyDetector? = null

    private fun debugLog(message: String) {
        Log.d(
            LOG_TAG,
            "$message; activeAnimations=${detector?.activeAnimations} isGestureActive=${detector?.isGestureActive} lastTransitionEnd=${detector?.lastTransitionEndedAtMs ?: -1}"
        )
    }

    private fun normalizeGestureType(type: MapGestureType?): String? = when (type) {
        MapGestureType.Move -> "pan"
        MapGestureType.Scale -> "pinch"
        MapGestureType.Rotate -> "rotate"
        MapGestureType.Shove -> "pitch"
        MapGestureType.Fling -> "fling"
        null -> null
    }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)

        if (!hasOnMapSteady) return

        mapView.getMapAsync { mapboxMap ->
            val det = MapSteadyDetector(
                mapboxMap = mapboxMap,
                quietPeriodMs = quietPeriodMs ?: 200.0,
                maxIntervalMs = maxIntervalMs,
            )
            det.onSteady = { idleDurationMs, lastGestureType ->
                debugLog("EMIT steady idleDurationMs=$idleDurationMs lastGestureType=$lastGestureType")
                mManager.handleEvent(
                    MapSteadyEvent.make(
                        this,
                        "steady",
                        idleDurationMs,
                        normalizeGestureType(lastGestureType)
                    )
                )
            }
            det.onTimeout = { lastGestureType ->
                debugLog("EMIT timeout lastGestureType=$lastGestureType")
                mManager.handleEvent(
                    MapSteadyEvent.make(
                        this,
                        "timeout",
                        null,
                        normalizeGestureType(lastGestureType)
                    )
                )
            }
            det.attach()
            detector = det
            debugLog("addToMap and subscribed to gestures")
        }
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        debugLog("removeFromMap and unsubscribed from gestures")
        detector?.detach()
        detector = null
        return super.removeFromMap(mapView, reason)
    }

    companion object {
        const val LOG_TAG = "RNMBXCameraGestureObserver"
    }
}
