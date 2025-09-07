
package com.rnmapbox.rnmbx.v11compat.mapboxmap

import android.animation.Animator
import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import androidx.activity.result.contract.ActivityResultContracts
import com.mapbox.bindgen.Expected
import com.mapbox.bindgen.ExpectedFactory
import com.mapbox.bindgen.None
import com.mapbox.bindgen.Value
import com.mapbox.maps.CameraOptions
import com.mapbox.maps.MapView
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
    this.setFeatureState(sourceId, sourceLayerId, featureId, state)
    callback(ExpectedFactory.createNone<String>())
}

fun MapboxMap.removeFeatureStateCompat(
    sourceId: String,
    sourceLayerId: String?,
    featureId: String,
    stateKey: String?,
    callback: (Expected<String, None>) -> Unit
) {
    this.removeFeatureState(sourceId, sourceLayerId, featureId, stateKey)
    callback(ExpectedFactory.createNone<String>())
}

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

fun MapboxMap.Companion.clearData(context: Context, callback: (result: Expected<String, None>) -> Unit) {
    MapView(context).getMapboxMap().clearData(callback)
}
