package com.rnmapbox.rnmbx.components.camera

import android.animation.Animator
import com.mapbox.maps.plugin.animation.MapAnimationOptions
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.plugin.animation.CameraAnimationsPlugin
import com.rnmapbox.rnmbx.components.camera.CameraStop
import com.rnmapbox.rnmbx.components.camera.RNMBXCamera
import com.mapbox.maps.CameraOptions
import android.view.animation.LinearInterpolator
import android.view.animation.AccelerateDecelerateInterpolator
import com.rnmapbox.rnmbx.components.camera.CameraUpdateQueue.OnCompleteAllListener
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.components.camera.CameraUpdateItem
import com.facebook.react.bridge.ReactApplicationContext
import com.rnmapbox.rnmbx.components.AbstractEventEmitter
import com.rnmapbox.rnmbx.components.camera.RNMBXCameraManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.plugin.animation.MapAnimationOptions.Companion.mapAnimationOptions
import com.mapbox.maps.plugin.animation.easeTo
import com.mapbox.maps.plugin.animation.flyTo
import com.rnmapbox.rnmbx.components.camera.constants.CameraMode
import com.rnmapbox.rnmbx.v11compat.mapboxmap.easeToV11
import com.rnmapbox.rnmbx.v11compat.mapboxmap.flyToV11
import java.lang.ref.WeakReference
import java.util.concurrent.ExecutionException
import java.util.concurrent.RunnableFuture
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

class CameraUpdateItem(
    map: MapboxMap,
    private val mCameraUpdate: CameraOptions,
    val duration: Int,
    private val mCallback: Animator.AnimatorListener?,
    @param:CameraMode.Mode private val mCameraMode: Int
) : RunnableFuture<Void?> {
    private var isCameraActionFinished = false
    private var isCameraActionCancelled = false
    private val mMap: WeakReference<MapboxMap>

    internal enum class CallbackMode {
        START, END, CANCEL, REPEAT
    }

    init {
        mMap = WeakReference(map)
    }

    override fun run() {
        val callback: Animator.AnimatorListener = object : Animator.AnimatorListener {
            override fun onAnimationStart(animator: Animator) {
                isCameraActionCancelled = false
                isCameraActionFinished = false
                mCallback?.onAnimationStart(animator)
            }

            override fun onAnimationEnd(animator: Animator) {
                isCameraActionCancelled = false
                isCameraActionFinished = true
                mCallback?.onAnimationEnd(animator)
            }

            override fun onAnimationCancel(animator: Animator) {
                isCameraActionCancelled = true
                isCameraActionFinished = false
                mCallback?.onAnimationCancel(animator)
            }

            override fun onAnimationRepeat(animator: Animator) {
                isCameraActionCancelled = false
                isCameraActionFinished = false
                mCallback?.onAnimationRepeat(animator)
            }
        }
        val map = mMap.get()
        if (map == null) {
            isCameraActionCancelled = true
            return
        }
        val animationOptions = MapAnimationOptions.Builder();

        // animateCamera / easeCamera only allows positive duration
        if (duration == 0 || mCameraMode == CameraMode.MOVE || mCameraMode == CameraMode.NONE) {
            map.flyToV11(mCameraUpdate, animationOptions.apply {
                duration(0)
            },
            callback)
        }

        // On iOS a duration of -1 means default or dynamic duration (based on flight-path length)
        // On Android we can fallback to Mapbox's default duration as there is no such API
        if (duration > 0) {
            animationOptions.apply { duration(duration.toLong()) }
        }
        if (mCameraMode == CameraMode.FLIGHT) {
            map.flyToV11(mCameraUpdate, animationOptions, callback)
        } else if (mCameraMode == CameraMode.LINEAR) {
            map.easeToV11(
                mCameraUpdate,animationOptions.apply { interpolator(LinearInterpolator()) },
                callback
            )
        } else if (mCameraMode == CameraMode.EASE) {
            map.easeToV11(
                mCameraUpdate,
                animationOptions.apply{ interpolator(AccelerateDecelerateInterpolator()) },
                callback
            )
        }
    }

    override fun cancel(mayInterruptIfRunning: Boolean): Boolean {
        return false
    }

    override fun isCancelled(): Boolean {
        return isCameraActionCancelled
    }

    override fun isDone(): Boolean {
        return isCameraActionFinished
    }

    @Throws(InterruptedException::class, ExecutionException::class)
    override fun get(): Void? {
        return null
    }

    @Throws(InterruptedException::class, ExecutionException::class, TimeoutException::class)
    override fun get(timeout: Long, unit: TimeUnit): Void? {
        return null
    }
}