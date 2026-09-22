package com.rnmapbox.rnmbx.components.mapview.helpers

import android.animation.ValueAnimator
import android.os.Handler
import android.os.Looper
import com.mapbox.android.gestures.MoveGestureDetector
import com.mapbox.android.gestures.RotateGestureDetector
import com.mapbox.android.gestures.ShoveGestureDetector
import com.mapbox.android.gestures.StandardScaleGestureDetector
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.plugin.animation.CameraAnimationsLifecycleListener
import com.mapbox.maps.plugin.animation.CameraAnimatorType
import com.mapbox.maps.plugin.gestures.OnMoveListener
import com.mapbox.maps.plugin.gestures.OnRotateListener
import com.mapbox.maps.plugin.gestures.OnScaleListener
import com.mapbox.maps.plugin.gestures.OnShoveListener
import com.rnmapbox.rnmbx.components.mapview.MapGestureType

class MapSteadyDetector(
    private val mapboxMap: MapboxMap,
    var quietPeriodMs: Double = 200.0,
    var maxIntervalMs: Double? = null,
) {
    var onSteady: ((idleDurationMs: Double, lastGestureType: MapGestureType?) -> Unit)? = null
    var onTimeout: ((lastGestureType: MapGestureType?) -> Unit)? = null

    private val handler = Handler(Looper.getMainLooper())
    var activeAnimations: Int = 0
        private set
    var isGestureActive: Boolean = false
        private set
    private var lastGestureType: MapGestureType? = null
    var lastTransitionEndedAtMs: Double? = null
        private set
    private var quietRunnable: Runnable? = null
    private var timeoutRunnable: Runnable? = null

    private fun nowMs(): Double = System.currentTimeMillis().toDouble()

    private val canEmitSteady: Boolean
        get() = activeAnimations == 0 && !isGestureActive && lastTransitionEndedAtMs != null

    fun attach() {
        mapboxMap.cameraAnimationsPlugin {
            addCameraAnimationsLifecycleListener(object : CameraAnimationsLifecycleListener {
                override fun onAnimatorStarting(type: CameraAnimatorType, animator: ValueAnimator, owner: String?) {
                    if (owner != GESTURES_OWNER) return
                    activeAnimations++
                    lastTransitionEndedAtMs = null
                    markActivity()
                }

                override fun onAnimatorEnding(type: CameraAnimatorType, animator: ValueAnimator, owner: String?) {
                    if (owner != GESTURES_OWNER) return
                    handleAnimatorEnd()
                }

                override fun onAnimatorCancelling(type: CameraAnimatorType, animator: ValueAnimator, owner: String?) {
                    if (owner != GESTURES_OWNER) return
                    handleAnimatorEnd()
                }

                override fun onAnimatorInterrupting(
                    type: CameraAnimatorType,
                    runningAnimator: ValueAnimator,
                    runningAnimatorOwner: String?,
                    newAnimator: ValueAnimator,
                    newAnimatorOwner: String?
                ) {}
            })
        }

        mapboxMap.gesturesPlugin {
            addOnMoveListener(object : OnMoveListener {
                override fun onMoveBegin(detector: MoveGestureDetector) { handleGestureBegin(MapGestureType.Move) }
                override fun onMove(detector: MoveGestureDetector): Boolean = false
                override fun onMoveEnd(detector: MoveGestureDetector) { handleGestureEnd(MapGestureType.Move) }
            })
            addOnScaleListener(object : OnScaleListener {
                override fun onScaleBegin(detector: StandardScaleGestureDetector) { handleGestureBegin(MapGestureType.Scale) }
                override fun onScale(detector: StandardScaleGestureDetector) {}
                override fun onScaleEnd(detector: StandardScaleGestureDetector) { handleGestureEnd(MapGestureType.Scale) }
            })
            addOnRotateListener(object : OnRotateListener {
                override fun onRotateBegin(detector: RotateGestureDetector) { handleGestureBegin(MapGestureType.Rotate) }
                override fun onRotate(detector: RotateGestureDetector) {}
                override fun onRotateEnd(detector: RotateGestureDetector) { handleGestureEnd(MapGestureType.Rotate) }
            })
            addOnShoveListener(object : OnShoveListener {
                override fun onShoveBegin(detector: ShoveGestureDetector) { handleGestureBegin(MapGestureType.Shove) }
                override fun onShove(detector: ShoveGestureDetector) {}
                override fun onShoveEnd(detector: ShoveGestureDetector) { handleGestureEnd(MapGestureType.Shove) }
            })
        }
    }

    fun detach() {
        cancelQuietTimer()
        cancelTimeoutTimer()
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
        cancelQuietTimer()
        if (quietPeriodMs <= 0) {
            maybeEmitSteady()
            return
        }
        val runnable = Runnable { maybeEmitSteady() }
        handler.postDelayed(runnable, quietPeriodMs.toLong())
        quietRunnable = runnable
    }

    private fun scheduleTimeoutTimer() {
        if (timeoutRunnable != null) return
        val delay = maxIntervalMs ?: return
        if (delay <= 0) return
        val runnable = Runnable {
            timeoutRunnable = null
            onTimeout?.invoke(lastGestureType)
            scheduleTimeoutTimer()
        }
        handler.postDelayed(runnable, delay.toLong())
        timeoutRunnable = runnable
    }

    private fun markActivity(gestureType: MapGestureType? = null) {
        if (gestureType != null) lastGestureType = gestureType
        scheduleQuietCheck()
        scheduleTimeoutTimer()
    }

    private fun maybeEmitSteady() {
        if (!canEmitSteady) return
        val lastEnd = lastTransitionEndedAtMs ?: return
        val sinceEnd = nowMs() - lastEnd
        if (sinceEnd < quietPeriodMs) return
        cancelQuietTimer()
        cancelTimeoutTimer()
        val gesture = lastGestureType
        onSteady?.invoke(sinceEnd, gesture)
        lastGestureType = null
    }

    private fun handleAnimatorEnd() {
        activeAnimations--
        if (activeAnimations < 0) activeAnimations = 0
        lastTransitionEndedAtMs = nowMs()
        scheduleQuietCheck()
    }

    private fun handleGestureBegin(type: MapGestureType) {
        isGestureActive = true
        lastGestureType = type
        lastTransitionEndedAtMs = null
        markActivity(lastGestureType)
    }

    private fun handleGestureEnd(type: MapGestureType) {
        lastGestureType = type
        isGestureActive = false
        lastTransitionEndedAtMs = nowMs()
        markActivity(lastGestureType)
    }

    companion object {
        private const val GESTURES_OWNER = "Maps-Gestures"
    }
}
