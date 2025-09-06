package com.rnmapbox.rnmbx.v11compat.mapboxmap

import android.animation.Animator
import android.content.Context
import com.mapbox.bindgen.Value
import com.mapbox.bindgen.Expected
import com.mapbox.bindgen.None
import com.mapbox.maps.AsyncOperationResultCallback
import com.mapbox.maps.CameraOptions
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.plugin.animation.MapAnimationOptions
import com.mapbox.maps.plugin.animation.easeTo
import com.mapbox.maps.plugin.animation.flyTo

fun MapboxMap.setFeatureStateCompat(
    sourceId: String,
    sourceLayerId: String?,
    featureId: String,
    state: Value,
    callback: (Expected<String, None>) -> Unit
) {
    this.setFeatureState(sourceId, sourceLayerId, featureId, state) { _ ->
        callback(com.mapbox.bindgen.ExpectedFactory.createNone<String>())
    }
}

fun MapboxMap.removeFeatureStateCompat(
    sourceId: String,
    sourceLayerId: String?,
    featureId: String,
    stateKey: String?,
    callback: (Expected<String, None>) -> Unit
) {
    this.removeFeatureState(sourceId, sourceLayerId, featureId, stateKey) { _ ->
        callback(com.mapbox.bindgen.ExpectedFactory.createNone<String>())
    }
}

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
