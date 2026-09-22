package com.rnmapbox.rnmbx.components.mapview.helpers

import android.animation.ValueAnimator
import com.mapbox.android.gestures.MoveGestureDetector
import com.mapbox.android.gestures.RotateGestureDetector
import com.mapbox.android.gestures.ShoveGestureDetector
import com.mapbox.android.gestures.StandardScaleGestureDetector
import com.mapbox.common.Cancelable
import com.mapbox.maps.CameraChanged
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.plugin.animation.CameraAnimationsLifecycleListener
import com.mapbox.maps.plugin.animation.CameraAnimatorType
import com.mapbox.maps.plugin.animation.MapAnimationOwnerRegistry
import com.mapbox.maps.plugin.gestures.OnMoveListener
import com.mapbox.maps.plugin.gestures.OnRotateListener
import com.mapbox.maps.plugin.gestures.OnScaleListener
import com.mapbox.maps.plugin.gestures.OnShoveListener
import com.rnmapbox.rnmbx.components.mapview.MapGestureType

/**
 * Detects camera changes and derives why the camera is moving (gesture, animation owner, or
 * programmatic). Emits [onCameraChange] on every frame tick while the camera is in motion,
 * with a [CameraChangeReason] derived from live animation/gesture state rather than stale flags,
 * along with a [CameraChangePayload] snapshot of the camera.
 */
class MapCameraChangeDetector(private val mapboxMap: MapboxMap) {
    var onMapCameraChange: ((cameraChanged: CameraChanged, derivedReason: CameraChangeReason) -> Unit)? = null

    private var isGestureActive: Boolean = false
    private var activeAnimationOwner: String? = null
    private var cameraChangedSubscription: Cancelable? = null

    private val derivedReason: CameraChangeReason
        get() = when {
            isGestureActive -> CameraChangeReason.USER_GESTURE
            activeAnimationOwner == MapAnimationOwnerRegistry.GESTURES -> CameraChangeReason.USER_GESTURE
            activeAnimationOwner == MapAnimationOwnerRegistry.LOCATION -> CameraChangeReason.SDK_ANIMATION
            activeAnimationOwner == MapAnimationOwnerRegistry.COMPASS -> CameraChangeReason.SDK_ANIMATION
            activeAnimationOwner == MapAnimationOwnerRegistry.INTERNAL -> CameraChangeReason.SDK_ANIMATION
            activeAnimationOwner != null -> CameraChangeReason.DEVELOPER_ANIMATION
            else -> CameraChangeReason.NONE
        }

    private val animationsLifecycleListener = object : CameraAnimationsLifecycleListener {
        override fun onAnimatorStarting(type: CameraAnimatorType, animator: ValueAnimator, owner: String?) {
            if (activeAnimationOwner == null) activeAnimationOwner = owner
        }

        override fun onAnimatorEnding(type: CameraAnimatorType, animator: ValueAnimator, owner: String?) {
            if (owner == activeAnimationOwner) activeAnimationOwner = null
        }

        override fun onAnimatorCancelling(type: CameraAnimatorType, animator: ValueAnimator, owner: String?) {
            if (owner == activeAnimationOwner) activeAnimationOwner = null
        }

        override fun onAnimatorInterrupting(
            type: CameraAnimatorType,
            runningAnimator: ValueAnimator,
            runningAnimatorOwner: String?,
            newAnimator: ValueAnimator,
            newAnimatorOwner: String?
        ) {
            activeAnimationOwner = newAnimatorOwner
        }
    }

    fun attach() {
        cameraChangedSubscription = mapboxMap.subscribeCameraChanged { cameraChanged ->
            onMapCameraChange?.invoke(cameraChanged, derivedReason)
        }

        mapboxMap.cameraAnimationsPlugin {
            addCameraAnimationsLifecycleListener(animationsLifecycleListener)
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
                override fun onShove(detector: ShoveGestureDetector) { }
                override fun onShoveEnd(detector: ShoveGestureDetector) { handleGestureEnd(MapGestureType.Shove) }
            })
        }
    }

    private fun handleGestureBegin(type: MapGestureType) {
        isGestureActive = true
    }

    private fun handleGestureEnd(type: MapGestureType) {
        isGestureActive = false
    }

    fun detach() {
        cameraChangedSubscription?.cancel()
        cameraChangedSubscription = null
        mapboxMap.cameraAnimationsPlugin {
            removeCameraAnimationsLifecycleListener(animationsLifecycleListener)
        }
    }
}