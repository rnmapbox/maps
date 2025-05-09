package com.rnmapbox.rnmbx.components.camera

import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.LinearInterpolator
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.mapbox.maps.ScreenCoordinate
import com.mapbox.maps.extension.style.expressions.dsl.generated.zoom
import com.mapbox.maps.plugin.animation.MapAnimationOptions
import com.mapbox.maps.plugin.animation.easeTo
import com.mapbox.maps.plugin.animation.moveBy
import com.mapbox.maps.plugin.animation.scaleBy
import com.mapbox.maps.toCameraOptions
import com.rnmapbox.rnmbx.NativeRNMBXCameraModuleSpec
import com.rnmapbox.rnmbx.components.camera.constants.CameraMode
import com.rnmapbox.rnmbx.components.mapview.CommandResponse
import com.rnmapbox.rnmbx.utils.ViewRefTag
import com.rnmapbox.rnmbx.utils.ViewTagResolver


class RNMBXCameraModule(context: ReactApplicationContext, val viewTagResolver: ViewTagResolver) : NativeRNMBXCameraModuleSpec(context) {
    private fun withViewportOnUIThread(
        viewRef: ViewRefTag?,
        reject: Promise,
        fn: (RNMBXCamera) -> Unit
    ) {
        if (viewRef == null) {
            reject.reject(Exception("viewRef is null"))
        } else {
            viewTagResolver.withViewResolved(viewRef.toInt(), reject, fn)
        }
    }

    private fun createCommandResponse(promise: Promise): CommandResponse = object : CommandResponse {
        override fun success(builder: (WritableMap) -> Unit) {
            val payload: WritableMap = WritableNativeMap()
            builder(payload)

            promise.resolve(payload)
        }

        override fun error(message: String) {
            promise.reject(Exception(message))
        }
    }

    companion object {
      const val NAME = "RNMBXCameraModule"
    }

    override fun updateCameraStop(viewRef: ViewRefTag?, stop: ReadableMap, promise: Promise) {
        withViewportOnUIThread(viewRef, promise) {
            it.updateCameraStop(stop)
            promise.resolve(null)
        }
    }

    private fun getAnimationOptions(
        animationMode: Double?,
        animationDuration: Double?
    ): MapAnimationOptions {
        return MapAnimationOptions.Builder()
            .apply {
                when (animationMode?.toInt()) {
                    CameraMode.LINEAR -> interpolator(LinearInterpolator())
                    CameraMode.EASE -> interpolator(AccelerateDecelerateInterpolator())
                }
                animationDuration?.let { duration ->
                    duration(duration.toLong())
                }
            }
            .build()
    }

    override fun moveBy(
        viewRef: ViewRefTag?,
        x: Double,
        y: Double,
        animationMode: Double?,
        animationDuration: Double?,
        promise: Promise
    ) {
        withViewportOnUIThread(viewRef, promise) {
            it.mapboxMap?.let { map ->
                val animationOptions = getAnimationOptions(animationMode, animationDuration)
                map.moveBy(ScreenCoordinate(x, y), animationOptions)

                promise.resolve(null)
            }
        }
    }

    override fun easeTo(
        viewRef: ViewRefTag?,
        x: Double,
        y: Double,
        animationDuration: Double?,
        scaleFactor: Double?,
        promise: Promise
    ) {
        withViewportOnUIThread(viewRef, promise) {
            it.mapboxMap?.let { map ->
                val cameraOptions =
                    map.cameraState.toCameraOptions().toBuilder().apply {
                        scaleFactor?.let { scale ->
                            zoom(map.cameraState.zoom + scale)
                        }
                        center(map.coordinateForPixel(ScreenCoordinate(x, y)))
                    }.build()

                val animationOptions =
                    getAnimationOptions(CameraMode.EASE.toDouble(), animationDuration)

                map.easeTo(cameraOptions, animationOptions)

                promise.resolve(null)
            }
        }
    }

    override fun scaleBy(
        viewRef: ViewRefTag?,
        x: Double,
        y: Double,
        animationMode: Double?,
        animationDuration: Double?,
        scaleFactor: Double?,
        promise: Promise
    ) {
        withViewportOnUIThread(viewRef, promise) {
            it.mapboxMap?.let { map ->
                val animationOptions =
                    getAnimationOptions(animationMode, animationDuration)

                map.scaleBy(scaleFactor ?: 1.0, ScreenCoordinate(x, y), animationOptions)

                promise.resolve(null)
            }
        }
    }
}