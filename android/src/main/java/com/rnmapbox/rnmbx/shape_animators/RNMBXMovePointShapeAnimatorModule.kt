package com.rnmapbox.rnmbx.shape_animators

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.mapbox.geojson.GeoJson
import com.mapbox.geojson.LineString
import com.mapbox.geojson.Point
import com.mapbox.turf.TurfConstants
import com.mapbox.turf.TurfMeasurement
import com.rnmapbox.rnmbx.NativeRNMBXMovePointShapeAnimatorModuleSpec

class MovePointShapeAnimator(tag: Tag, coordinate: Point) : ShapeAnimatorCommon(tag) {
    var sourceCoord = coordinate
    var progressCoord = sourceCoord
    var targetCoord = sourceCoord

    var startTimestamp: Long = 0
    var totalDurationSec: Double = 0.0

    override fun getAnimatedShape(currentTimestamp: Long): Pair<GeoJson, Boolean> {
        val progressSec = (currentTimestamp - startTimestamp).toDouble() / 1000
        val line = LineString.fromLngLats(listOf(sourceCoord, targetCoord))
        val lineLength = TurfMeasurement.length(line, TurfConstants.UNIT_METERS)
        progressCoord = TurfMeasurement.along(line, lineLength * (progressSec / totalDurationSec), TurfConstants.UNIT_METERS)
        return Pair(progressCoord, true)
    }

    fun moveTo(coordinate: Point, durationSec: Double) {
        sourceCoord = progressCoord
        progressCoord = sourceCoord
        targetCoord = coordinate

        startTimestamp = getCurrentTimestamp()
        totalDurationSec = durationSec
    }
}

@ReactModule(name = RNMBXMovePointShapeAnimatorModule.NAME)
class RNMBXMovePointShapeAnimatorModule(
    reactContext: ReactApplicationContext?,
    val shapeAnimatorManager: ShapeAnimatorManager
): NativeRNMBXMovePointShapeAnimatorModuleSpec(reactContext) {
    companion object {
        const val LOG_TAG = "RNMBXMovePointShapeAnimatorModule"
        const val NAME = "RNMBXMovePointShapeAnimatorModule"
    }

    @ReactMethod
    override fun start(tag: Double, promise: Promise?) {
        shapeAnimatorManager.get(tag.toLong())?.start()
    }

    @ReactMethod
    override fun create(tag: Double, startCoordinate: ReadableArray, promise: Promise) {
        shapeAnimatorManager.add(
            MovePointShapeAnimator(
                tag.toLong(),
                Point.fromLngLat(
                    startCoordinate.getDouble(0),
                    startCoordinate.getDouble(1)
                )
            )
        )
        promise.resolve(tag.toInt())
    }

    @ReactMethod
    override fun moveTo(
        tag: Double,
        coordinate: ReadableArray?,
        duration: Double,
        promise: Promise?
    ) {
        val animator = shapeAnimatorManager.get(tag.toLong()) as MovePointShapeAnimator

        val targetCoord = Point.fromLngLat(
            coordinate!!.getDouble(0),
            coordinate.getDouble(1)
        )
        animator.moveTo(targetCoord, duration / 1000)
    }
}