package com.rnmapbox.rnmbx.shapeAnimators

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.mapbox.geojson.GeoJson
import com.mapbox.geojson.LineString
import com.mapbox.geojson.Point
import com.mapbox.turf.TurfConstants.UNIT_METERS
import com.mapbox.turf.TurfMeasurement
import com.rnmapbox.rnmbx.NativeRNMBXMovePointShapeAnimatorModuleSpec

class MovePointShapeAnimator(tag: Tag, coordinate: Point) : ShapeAnimatorCommon(tag) {
    private var point = AnimatableElement<Point>(
        coordinate,
        coordinate,
        coordinate,
        0,
        0.0,
        0.0,
        { a, b -> TurfMeasurement.distance(a, b) }
    )

    override fun getAnimatedShape(currentTimestamp: Long): GeoJson {
        val line = LineString.fromLngLats(listOf(point.source, point.target))
        val lineLength = TurfMeasurement.length(line, UNIT_METERS)
        if (lineLength == 0.0) {
            stop()
        }

        if (point.durationRatio() < 1) {
            point.setProgress(
                TurfMeasurement.along(line, lineLength * point.durationRatio(), UNIT_METERS),
                currentTimestamp
            )
        }

        if (point.durationRatio() >= 1) {
            stop()
        }

        return point.progress
    }

    fun moveTo(coordinate: Point, durationSec: Double) {
        start()
        point.reset(
            point.progress,
            point.progress,
            coordinate,
            durationSec,
            getCurrentTimestamp()
        )
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