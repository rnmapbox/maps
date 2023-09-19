package com.mapbox.rnmbx.v11compat.mapboxmap;

import android.animation.Animator
import com.mapbox.maps.CameraOptions
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.plugin.animation.MapAnimationOptions
import com.mapbox.maps.plugin.animation.easeTo
import com.mapbox.maps.plugin.animation.flyTo

fun MapboxMap.flyToV11(
    cameraOptions: CameraOptions,
    animationOptions: MapAnimationOptions.Builder,
    callback: Animator.AnimatorListener
) {
    this.flyTo(
        cameraOptions,
        animationOptions.apply { animatorListener(callback) }.build(),
    )
}

fun MapboxMap.easeToV11(
    cameraOptions: CameraOptions,
    animationOptions: MapAnimationOptions.Builder,
    callback: Animator.AnimatorListener
) {
    this.easeTo(
        cameraOptions,
        animationOptions.apply { animatorListener(callback) }.build(),

    )
}
