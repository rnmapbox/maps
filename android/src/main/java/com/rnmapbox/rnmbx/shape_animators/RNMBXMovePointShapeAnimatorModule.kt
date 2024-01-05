package com.rnmapbox.rnmbx.shape_animators

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.mapbox.geojson.GeoJson
import com.mapbox.geojson.Point
import com.rnmapbox.rnmbx.NativeRNMBXMovePointShapeAnimatorModuleSpec
import kotlin.time.Duration
import kotlin.time.DurationUnit

/// Simple dummy animator that moves the point lng, lat by 0.01, 0.01 each second.
class MovePointShapeAnimator(tag: Tag, val lng: Double, val lat: Double) : ShapeAnimatorCommon(tag) {
    override fun getAnimatedShape(timeSinceStart: Duration): Pair<GeoJson, Boolean> {
        return Pair(
            Point.fromLngLat(
                lng + timeSinceStart.toDouble(DurationUnit.SECONDS) * 0.01,
                lat + timeSinceStart.toDouble(DurationUnit.SECONDS) * 0.01
            ), true
        );
    }
}

@ReactModule(name = RNMBXMovePointShapeAnimatorModule.NAME)
class RNMBXMovePointShapeAnimatorModule(reactContext: ReactApplicationContext?, val shapeAnimatorManager: ShapeAnimatorManager) :
    NativeRNMBXMovePointShapeAnimatorModuleSpec(reactContext) {

    companion object {
        const val LOG_TAG = "RNMBXMovePointShapeAnimatorModule"
        const val NAME = "RNMBXMovePointShapeAnimatorModule"
    }

    @ReactMethod
    override fun start(tag: Double, promise: Promise?) {
        shapeAnimatorManager?.get(tag.toLong())?.let {
            it.start()
        }
    }

    @ReactMethod
    override fun create(tag: Double, from: ReadableArray, promise: Promise) {
        shapeAnimatorManager.add(
            MovePointShapeAnimator(
                tag.toLong(),
                from.getDouble(0),
                from.getDouble(1)
            )
        )
        promise.resolve(tag.toInt())
    }
}