package com.rnmapbox.rnmbx.v11compat.mapboxmap

import android.animation.Animator
import android.content.Context
import com.mapbox.maps.AsyncOperationResultCallback
import com.mapbox.maps.CameraOptions
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.plugin.animation.MapAnimationOptions
import com.mapbox.maps.plugin.animation.easeTo
import com.mapbox.maps.plugin.animation.flyTo

fun MapboxMap.flyToV11(
    cameraOptions: CameraOptions,
    animationOptions: MapAnimationOptions.Builder,
    animationListener: Animator.AnimatorListener
) {
    this.flyTo(
        cameraOptions,
        animationOptions.build(),
        animationListener
    )
}

fun MapboxMap.easeToV11(
    cameraOptions: CameraOptions,
    animationOptions: MapAnimationOptions.Builder,
    animationListener: Animator.AnimatorListener
) {
    this.easeTo(
        cameraOptions,
        animationOptions.build(),
        animationListener
    )
}

fun MapboxMap.clearData(callback: AsyncOperationResultCallback) {
    return MapboxMap.clearData(callback)
}

fun MapboxMap.Companion.clearData(context: Context, callback: AsyncOperationResultCallback) {
    this.clearData(callback)
}