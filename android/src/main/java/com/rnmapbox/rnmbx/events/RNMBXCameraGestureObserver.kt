package com.rnmapbox.rnmbx.events

import android.animation.ValueAnimator
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.mapbox.android.gestures.MoveGestureDetector
import com.mapbox.android.gestures.RotateGestureDetector
import com.mapbox.android.gestures.ShoveGestureDetector
import com.mapbox.android.gestures.StandardScaleGestureDetector
import com.mapbox.common.Cancelable
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.plugin.animation.CameraAnimationsLifecycleListener
import com.mapbox.maps.plugin.animation.CameraAnimatorType
import com.mapbox.maps.plugin.gestures.OnMoveListener
import com.mapbox.maps.plugin.gestures.OnRotateListener
import com.mapbox.maps.plugin.gestures.OnScaleListener
import com.mapbox.maps.plugin.gestures.OnShoveListener
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView

class RNMBXCameraGestureObserver(
    private val mContext: Context,
    private val mManager: RNMBXCameraGestureObserverManager
) : AbstractMapFeature(mContext) {

    var hasOnMapSteady: Boolean = false
    var hasOnCameraChanged: Boolean = false
    var quietPeriodMs: Double? = null
    var maxIntervalMs: Double? = null

    override var requiresStyleLoad: Boolean = false

    private val handler = Handler(Looper.getMainLooper())
    private var activeAnimations: Int = 0
    private var activeGestures: Int = 0
    private val isGestureActive: Boolean get() = activeGestures > 0
    private var lastGestureType: String? = null
    private var lastTransitionEndedAtMs: Double? = null
    private var quietRunnable: Runnable? = null
    private var timeoutRunnable: Runnable? = null
    private var mapboxMap: MapboxMap? = null
    private var cameraChangedCancelable: Cancelable? = null

    private val quietMs: Double get() = quietPeriodMs ?: 200.0
    private val maxMs: Double? get() = maxIntervalMs

    private fun nowMs(): Double = System.currentTimeMillis().toDouble()
    private fun timestamp(): Double = nowMs()

    private val canEmitSteady: Boolean
        get() = activeAnimations == 0 && !isGestureActive && lastTransitionEndedAtMs != null

    private fun normalizeGestureType(type: String): String {
        return when (type) {
            "move" -> "pan"
            "scale" -> "pinch"
            "rotate" -> "rotate"
            "shove" -> "pitch"
            else -> type
        }
    }

    private fun debugLog(message: String) {
        Log.d(
            LOG_TAG,
            "$message; activeAnimations=$activeAnimations isGestureActive=$isGestureActive lastTransitionEnd=${lastTransitionEndedAtMs ?: -1}"
        )
    }

    private fun scheduleTimer(delay: Double, task: Runnable): Runnable {
        handler.removeCallbacks(task)
        if (delay > 0) {
            handler.postDelayed(task, delay.toLong())
        }
        return task
    }

    private fun cancelQuietTimer() {
        quietRunnable?.let { handler.removeCallbacks(it) }
        quietRunnable = null
    }

    private fun cancelTimeoutTimer() {
        timeoutRunnable?.let { handler.removeCallbacks(it) }
        timeoutRunnable = null
    }

    private fun scheduleQuietCheck() {
        if (!hasOnMapSteady) return
        cancelQuietTimer()
        val delay = quietMs
        if (delay <= 0) {
            maybeEmitSteady()
            return
        }
        debugLog("scheduleQuietCheck in ${delay.toInt()}ms")
        val runnable = Runnable {
            debugLog("quiet timer fired")
            maybeEmitSteady()
        }
        quietRunnable = scheduleTimer(delay, runnable)
    }

    private fun scheduleTimeout() {
        if (!hasOnMapSteady || timeoutRunnable != null) return
        val delay = maxMs ?: return
        val runnable = Runnable {
            timeoutRunnable = null
            emitTimeout()
        }
        timeoutRunnable = scheduleTimer(delay, runnable)
    }

    private fun markActivity(gestureType: String? = null) {
        if (gestureType != null) lastGestureType = gestureType
        scheduleQuietCheck()
        scheduleTimeout()
    }

    private fun maybeEmitSteady() {
        if (!canEmitSteady) return
        val lastEnd = lastTransitionEndedAtMs ?: return
        val sinceEnd = nowMs() - lastEnd
        if (sinceEnd < quietMs) return
        emitSteady(sinceEnd)
    }

    private fun emitSteady(idleDurationMs: Double) {
        cancelQuietTimer()
        cancelTimeoutTimer()
        val gesture = lastGestureType
        debugLog("EMIT steady idleDurationMs=$idleDurationMs lastGestureType=$gesture")
        mManager.handleEvent(
            MapSteadyEvent.make(this, "steady", idleDurationMs, gesture)
        )
        lastGestureType = null
    }

    private fun emitTimeout() {
        cancelQuietTimer()
        debugLog("EMIT timeout lastGestureType=$lastGestureType")
        mManager.handleEvent(
            MapSteadyEvent.make(this, "timeout", null, lastGestureType)
        )
        scheduleTimeout()
    }

    private val animationsListener = object : CameraAnimationsLifecycleListener {
        override fun onAnimatorStarting(
            type: CameraAnimatorType,
            animator: ValueAnimator,
            owner: String?
        ) {
            if (owner != GESTURES_ANIMATION_OWNER) return
            activeAnimations++
            lastTransitionEndedAtMs = null
            markActivity()
            debugLog("camera animator started")
        }

        override fun onAnimatorEnding(
            type: CameraAnimatorType,
            animator: ValueAnimator,
            owner: String?
        ) {
            if (owner != GESTURES_ANIMATION_OWNER) return
            handleAnimatorEnd()
        }

        override fun onAnimatorCancelling(
            type: CameraAnimatorType,
            animator: ValueAnimator,
            owner: String?
        ) {
            if (owner != GESTURES_ANIMATION_OWNER) return
            handleAnimatorEnd()
        }

        override fun onAnimatorInterrupting(
            type: CameraAnimatorType,
            runningAnimator: ValueAnimator,
            runningAnimatorOwner: String?,
            newAnimator: ValueAnimator,
            newAnimatorOwner: String?
        ) {
            // Interruptions are handled by the ending/starting callbacks
        }
    }

    private val moveListener = object : OnMoveListener {
        override fun onMoveBegin(detector: MoveGestureDetector) {
            handleGestureBegin("move")
        }

        override fun onMove(detector: MoveGestureDetector): Boolean {
            return false
        }

        override fun onMoveEnd(detector: MoveGestureDetector) {
            handleGestureEnd("move")
        }
    }

    private val scaleListener = object : OnScaleListener {
        override fun onScaleBegin(detector: StandardScaleGestureDetector) {
            handleGestureBegin("scale")
        }

        override fun onScale(detector: StandardScaleGestureDetector) {
        }

        override fun onScaleEnd(detector: StandardScaleGestureDetector) {
            handleGestureEnd("scale")
        }
    }

    private val rotateListener = object : OnRotateListener {
        override fun onRotateBegin(detector: RotateGestureDetector) {
            handleGestureBegin("rotate")
        }

        override fun onRotate(detector: RotateGestureDetector) {
        }

        override fun onRotateEnd(detector: RotateGestureDetector) {
            handleGestureEnd("rotate")
        }
    }

    private val shoveListener = object : OnShoveListener {
        override fun onShoveBegin(detector: ShoveGestureDetector) {
            handleGestureBegin("shove")
        }

        override fun onShove(detector: ShoveGestureDetector) {
        }

        override fun onShoveEnd(detector: ShoveGestureDetector) {
            handleGestureEnd("shove")
        }
    }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)

        if (!hasOnMapSteady && !hasOnCameraChanged) return

        mapView.getMapAsync { mapboxMap ->
            this.mapboxMap = mapboxMap
            mapboxMap.cameraAnimationsPlugin {
                addCameraAnimationsLifecycleListener(animationsListener)
            }
            mapboxMap.gesturesPlugin {
                addOnMoveListener(moveListener)
                addOnScaleListener(scaleListener)
                addOnRotateListener(rotateListener)
                addOnShoveListener(shoveListener)
            }
            if (hasOnCameraChanged) {
                cameraChangedCancelable = mapboxMap.subscribeCameraChanged {
                    emitCameraChanged(mapboxMap)
                }
            }

            debugLog("addToMap and subscribed to gestures")
        }
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        cameraChangedCancelable?.cancel()
        cameraChangedCancelable = null
        mapboxMap?.let { mapboxMap ->
            mapboxMap.cameraAnimationsPlugin {
                removeCameraAnimationsLifecycleListener(animationsListener)
            }
            mapboxMap.gesturesPlugin {
                removeOnMoveListener(moveListener)
                removeOnScaleListener(scaleListener)
                removeOnRotateListener(rotateListener)
                removeOnShoveListener(shoveListener)
            }
        }
        mapboxMap = null
        activeAnimations = 0
        activeGestures = 0
        debugLog("removeFromMap and unsubscribed from gestures")
        cancelQuietTimer()
        cancelTimeoutTimer()
        return super.removeFromMap(mapView, reason)
    }

    private fun emitCameraChanged(mapboxMap: MapboxMap) {
        mManager.handleEvent(
            CameraChangedEvent.make(
                this,
                mapboxMap,
                isGestureActive = isGestureActive,
                isUserInteraction = isGestureActive || activeAnimations > 0
            )
        )
    }

    private fun handleAnimatorEnd() {
        activeAnimations--
        if (activeAnimations < 0) {
            Log.w(LOG_TAG, "WARNING: activeAnimations went negative, resetting to 0")
            activeAnimations = 0
        }
        lastTransitionEndedAtMs = nowMs()
        scheduleQuietCheck()
        debugLog("camera animator ended")
    }

    private fun handleGestureBegin(type: String) {
        activeGestures++
        lastGestureType = normalizeGestureType(type)
        lastTransitionEndedAtMs = null
        markActivity(lastGestureType)
        debugLog("gesture didBegin type=$lastGestureType")
    }

    private fun handleGestureEnd(type: String) {
        lastGestureType = normalizeGestureType(type)
        if (activeGestures > 0) activeGestures--
        lastTransitionEndedAtMs = nowMs()
        markActivity(lastGestureType)
        debugLog("gesture didEnd type=$lastGestureType -> isGestureActive=$isGestureActive")
    }

    companion object {
        const val LOG_TAG = "RNMBXCameraGestureObserver"
        private const val GESTURES_ANIMATION_OWNER = "Maps-Gestures"
    }
}
