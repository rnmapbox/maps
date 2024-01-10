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
import com.mapbox.turf.TurfMisc
import kotlin.math.min
import com.rnmapbox.rnmbx.NativeRNMBXChangeLineOffsetsShapeAnimatorModuleSpec

class ChangeLineOffsetsShapeAnimator(tag: Tag, _lineString: LineString, startOffset: Double, endOffset: Double): ShapeAnimatorCommon(tag) {
    private var lineString = _lineString
    private var startOfLine = LineOffset(
        startOffset,
        startOffset,
        startOffset,
        0.0,
        0.0,
        0.0
    )
    private var endOfLine = LineOffset(
        endOffset,
        endOffset,
        endOffset,
        0.0,
        0.0,
        0.0
    )

    override fun getAnimatedShape(currentTimestamp: Long): Pair<GeoJson, Boolean> {
        if (lineString.coordinates().count() < 2) {
            return Pair(emptyGeoJsonObj, true)
        }

        startOfLine.progressOffset = startOfLine.sourceOffset + (startOfLine.offsetRemaining() * startOfLine.durationRatio())
        startOfLine.progressDurationSec = currentTimestamp - startOfLine.startedAt

        endOfLine.progressOffset = endOfLine.sourceOffset + (endOfLine.offsetRemaining() * endOfLine.durationRatio())
        endOfLine.progressDurationSec = currentTimestamp - endOfLine.startedAt

        val totalDistance = TurfMeasurement.length(lineString, TurfConstants.UNIT_METERS)
        val trimmed = TurfMisc.lineSliceAlong(
            lineString,
            startOfLine.progressOffset,
            totalDistance - endOfLine.progressOffset,
            TurfConstants.UNIT_METERS
        )
        return Pair(trimmed, true);
    }

    fun _setLineString(lineString: LineString) {
        this.lineString = lineString
    }

    fun _setStartOffset(offset: Double, durationSec: Double) {
        startOfLine = LineOffset(
            startOfLine.progressOffset,
            startOfLine.progressOffset,
            offset,
            getCurrentTimestamp().toDouble(),
            0.0,
            durationSec
        )
    }

    fun _setEndOffset(offset: Double, durationSec: Double) {
        endOfLine = LineOffset(
            endOfLine.progressOffset,
            endOfLine.progressOffset,
            offset,
            getCurrentTimestamp().toDouble(),
            0.0,
            durationSec
        )
    }
}

@ReactModule(name = RNMBXChangeLineOffsetsShapeAnimatorModule.NAME)
class RNMBXChangeLineOffsetsShapeAnimatorModule(
    reactContext: ReactApplicationContext?,
    val shapeAnimatorManager: ShapeAnimatorManager
): NativeRNMBXChangeLineOffsetsShapeAnimatorModuleSpec(reactContext) {
    companion object {
        const val LOG_TAG = "RNMBXChangeLineOffsetsShapeAnimatorModule"
        const val NAME = "RNMBXChangeLineOffsetsShapeAnimatorModule"
    }

    override fun create(
        tag: Double,
        coordinates: ReadableArray,
        startOffset: Double,
        endOffset: Double,
        promise: Promise?
    ) {
        val lineString = buildLineString(coordinates)

        shapeAnimatorManager.add(
            ChangeLineOffsetsShapeAnimator(
                tag.toLong(),
                lineString,
                startOffset,
                endOffset
            )
        )
        promise?.resolve(tag.toInt())
    }

    private fun getAnimator(tag: Double): ChangeLineOffsetsShapeAnimator {
        return shapeAnimatorManager.get(tag.toLong()) as ChangeLineOffsetsShapeAnimator
    }

    @ReactMethod
    override fun start(tag: Double, promise: Promise?) {
        val animator = getAnimator(tag)
        animator.start()
    }

    override fun setLineString(tag: Double, coordinates: ReadableArray?, promise: Promise?) {
        val animator = getAnimator(tag)

        if (coordinates == null) {
            return
        }

        val lineString = buildLineString(coordinates)
        animator._setLineString(lineString)
        promise?.resolve(true)
    }

    override fun setStartOffset(tag: Double, offset: Double, duration: Double, promise: Promise?) {
        val animator = getAnimator(tag)
        animator._setStartOffset(offset, duration)
        promise?.resolve(true)
    }

    override fun setEndOffset(tag: Double, offset: Double, duration: Double, promise: Promise?) {
        val animator = getAnimator(tag)
        animator._setEndOffset(offset, duration)
        promise?.resolve(true)
    }
}

private class LineOffset(
    var sourceOffset: Double,
    var progressOffset: Double,
    var targetOffset: Double,
    var startedAt: Double,
    var progressDurationSec: Double,
    var totalDurationSec: Double
) {
    fun offsetRemaining(): Double {
        return targetOffset - sourceOffset
    }

    fun durationRatio(): Double {
        return min(progressDurationSec / totalDurationSec, 1.0)
    }
}


private fun buildLineString(_coordinates: ReadableArray): LineString {
    var coordinates: List<Point> = listOf()

    for (i in 0 until _coordinates.size()) {
        val arr = _coordinates.getArray(i)
        val coord = Point.fromLngLat(arr.getDouble(0), arr.getDouble(1))
        coordinates = coordinates.plus(coord)
    }

    return LineString.fromLngLats(coordinates)
}