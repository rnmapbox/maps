package com.rnmapbox.rnmbx.components.camera

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.ReadableMap
import com.mapbox.android.gestures.MoveGestureDetector
import com.mapbox.android.gestures.RotateGestureDetector
import com.mapbox.android.gestures.ShoveGestureDetector
import com.mapbox.android.gestures.StandardScaleGestureDetector
import com.mapbox.common.Cancelable
import com.mapbox.maps.ScreenCoordinate
import com.mapbox.maps.plugin.gestures.OnMoveListener
import com.mapbox.maps.plugin.gestures.OnRotateListener
import com.mapbox.maps.plugin.gestures.OnScaleListener
import com.mapbox.maps.plugin.gestures.OnShoveListener
import com.mapbox.maps.plugin.gestures.gestures
import com.mapbox.maps.plugin.viewport.ViewportStatus
import com.mapbox.maps.plugin.viewport.ViewportStatusObserver
import com.mapbox.maps.plugin.viewport.data.ViewportStatusChangeReason
import com.mapbox.maps.plugin.viewport.state.FollowPuckViewportState
import com.mapbox.maps.plugin.viewport.viewport
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView

/**
 * Implements the object form of `transitionsToIdleUponUserInteraction`: the SDK's own option is off,
 * and this idles the viewport only when one of the selected gestures begins.
 *
 * The SDK has no double-tap listener, but its double-tap and two-finger-tap zoom animations notify
 * `OnScaleListener.onScaleBegin` without starting the scale detector. A scale begin is therefore
 * classified on the next main loop iteration: a pinch or quick zoom if the scale detector is in
 * progress by then, a double tap otherwise.
 */
class RNMBXViewportGestureHandler(
    private val map: RNMBXMapView,
    initialIdleGestures: IdleGestures,
    private val willIdle: () -> Unit
) : ViewportStatusObserver {
    data class IdleGestures(
        val pan: Boolean = true,
        val pinch: Boolean = true,
        val doubleTap: Boolean = true,
        val rotate: Boolean = true,
        val pitch: Boolean = true
    ) {
        companion object {
            fun from(value: ReadableMap?): IdleGestures {
                fun get(key: String) = if (value?.hasKey(key) == true && !value.isNull(key)) value.getBoolean(key) else true
                return IdleGestures(get("pan"), get("pinch"), get("doubleTap"), get("rotate"), get("pitch"))
            }
        }
    }

    private enum class Gesture { PAN, PINCH, DOUBLE_TAP, ROTATE, PITCH }

    var idleGestures: IdleGestures = initialIdleGestures
        set(value) {
            field = value
            updateZoomOverrides()
        }

    private val mapView = map.mapView
    private val handler = Handler(Looper.getMainLooper())

    private var cameraChangedCancelable: Cancelable? = null
    /** The focal point this handler set, or null if it isn't managing the focal point. */
    private var managedFocalPoint: ScreenCoordinate? = null
    private var managesPinchScroll = false

    private val moveListener = object : OnMoveListener {
        override fun onMoveBegin(detector: MoveGestureDetector) = gestureBegan(Gesture.PAN)
        override fun onMove(detector: MoveGestureDetector) = false
        override fun onMoveEnd(detector: MoveGestureDetector) {}
    }

    private val scaleListener = object : OnScaleListener {
        override fun onScaleBegin(detector: StandardScaleGestureDetector) {
            if (idleGestures.pinch == idleGestures.doubleTap) {
                gestureBegan(Gesture.PINCH)
                return
            }
            // the follow state would override the zoom before the classification
            clearFollowPuckOption(Gesture.PINCH)
            handler.post {
                gestureBegan(if (detector.isInProgress) Gesture.PINCH else Gesture.DOUBLE_TAP)
            }
        }
        override fun onScale(detector: StandardScaleGestureDetector) {}
        override fun onScaleEnd(detector: StandardScaleGestureDetector) {}
    }

    private val rotateListener = object : OnRotateListener {
        override fun onRotateBegin(detector: RotateGestureDetector) = gestureBegan(Gesture.ROTATE)
        override fun onRotate(detector: RotateGestureDetector) {}
        override fun onRotateEnd(detector: RotateGestureDetector) {}
    }

    private val shoveListener = object : OnShoveListener {
        override fun onShoveBegin(detector: ShoveGestureDetector) = gestureBegan(Gesture.PITCH)
        override fun onShove(detector: ShoveGestureDetector) {}
        override fun onShoveEnd(detector: ShoveGestureDetector) {}
    }

    init {
        mapView.gestures.addOnMoveListener(moveListener)
        mapView.gestures.addOnScaleListener(scaleListener)
        mapView.gestures.addOnRotateListener(rotateListener)
        mapView.gestures.addOnShoveListener(shoveListener)
        mapView.viewport.addStatusObserver(this)
        updateZoomOverrides()
    }

    fun detach() {
        handler.removeCallbacksAndMessages(null)
        stopZoomOverrides()
        mapView.gestures.removeOnMoveListener(moveListener)
        mapView.gestures.removeOnScaleListener(scaleListener)
        mapView.gestures.removeOnRotateListener(rotateListener)
        mapView.gestures.removeOnShoveListener(shoveListener)
        mapView.viewport.removeStatusObserver(this)
    }

    private fun gestureBegan(gesture: Gesture) {
        val idles = when (gesture) {
            Gesture.PAN -> idleGestures.pan
            Gesture.PINCH -> idleGestures.pinch
            Gesture.DOUBLE_TAP -> idleGestures.doubleTap
            Gesture.ROTATE -> idleGestures.rotate
            Gesture.PITCH -> idleGestures.pitch
        }
        if (idles) {
            if (mapView.viewport.status == ViewportStatus.Idle) return
            willIdle()
            mapView.viewport.idle()
        } else {
            clearFollowPuckOption(gesture)
        }
    }

    private fun clearFollowPuckOption(gesture: Gesture) {
        val followPuck = followPuckState(mapView.viewport.status) ?: return
        val options = followPuck.options.toBuilder()
        when (gesture) {
            Gesture.PINCH, Gesture.DOUBLE_TAP -> options.zoom(null)
            Gesture.ROTATE -> options.bearing(null)
            Gesture.PITCH -> options.pitch(null)
            Gesture.PAN -> return
        }
        followPuck.options = options.build()
    }

    private fun followPuckState(status: ViewportStatus): FollowPuckViewportState? =
        when (status) {
            is ViewportStatus.State -> status.state as? FollowPuckViewportState
            is ViewportStatus.Transition -> status.toState as? FollowPuckViewportState
            else -> null
        }

    // region ViewportStatusObserver

    override fun onViewportStatusChanged(
        from: ViewportStatus,
        to: ViewportStatus,
        reason: ViewportStatusChangeReason
    ) {
        updateZoomOverrides()
    }

    // endregion

    // region Zooming around the puck

    private fun updateZoomOverrides() {
        val status = mapView.viewport.status
        val following = status is ViewportStatus.State && status.state is FollowPuckViewportState
        if (following && (!idleGestures.pinch || !idleGestures.doubleTap)) {
            startZoomOverrides()
        } else {
            stopZoomOverrides()
        }
    }

    private fun startZoomOverrides() {
        if (cameraChangedCancelable != null) return

        if (mapView.gestures.focalPoint == null) {
            val focalPoint = puckScreenPoint()
            mapView.gestures.focalPoint = focalPoint
            managedFocalPoint = focalPoint
        }

        // a two-finger pan during a pinch would begin a move, which idles if `pan` is set
        if (!map.pinchPanEnabledSetByApp && mapView.gestures.pinchScrollEnabled) {
            mapView.gestures.pinchScrollEnabled = false
            managesPinchScroll = true
        }

        cameraChangedCancelable = mapView.mapboxMap.subscribeCameraChanged {
            val managed = managedFocalPoint ?: return@subscribeCameraChanged
            if (mapView.gestures.focalPoint != managed) {
                // someone else set a focal point, theirs wins
                managedFocalPoint = null
                return@subscribeCameraChanged
            }
            val focalPoint = puckScreenPoint()
            if (focalPoint != managed) {
                mapView.gestures.focalPoint = focalPoint
                managedFocalPoint = focalPoint
            }
        }
    }

    private fun stopZoomOverrides() {
        cameraChangedCancelable?.cancel()
        cameraChangedCancelable = null
        managedFocalPoint?.let {
            if (mapView.gestures.focalPoint == it) {
                mapView.gestures.focalPoint = null
            }
        }
        managedFocalPoint = null
        if (managesPinchScroll && !map.pinchPanEnabledSetByApp && !mapView.gestures.pinchScrollEnabled) {
            mapView.gestures.pinchScrollEnabled = true
        }
        managesPinchScroll = false
    }

    /** While following, the puck is at the centre of the padded viewport. Both are in pixels. */
    private fun puckScreenPoint(): ScreenCoordinate {
        val padding = mapView.mapboxMap.cameraState.padding
        return ScreenCoordinate(
            padding.left + (mapView.width - padding.left - padding.right) / 2.0,
            padding.top + (mapView.height - padding.top - padding.bottom) / 2.0
        )
    }

    // endregion
}
