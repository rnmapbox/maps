package com.rnmapbox.rnmbx.shapeAnimators

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.mapbox.geojson.GeoJson
import com.mapbox.geojson.LineString
import com.mapbox.geojson.Point
import com.mapbox.turf.TurfConstants.UNIT_METERS
import com.mapbox.turf.TurfMeasurement
import com.mapbox.turf.TurfMisc
import com.rnmapbox.rnmbx.NativeRNMBXChangeLineOffsetsShapeAnimatorModuleSpec
import com.rnmapbox.rnmbx.utils.ViewRefTag

class ChangeLineOffsetsShapeAnimator(tag: Tag, _lineString: LineString, startOffset: Double, endOffset: Double): ShapeAnimatorCommon(tag) {
    private var lineString = _lineString
    private var startOfLine = AnimatableElement<Double>(
        startOffset,
        startOffset,
        startOffset,
        0.0,
        0.0,
        0.0,
        { a, b -> b - a }
    )
    private var endOfLine = AnimatableElement<Double>(
        endOffset,
        endOffset,
        endOffset,
        0.0,
        0.0,
        0.0,
        { a, b -> b - a }
    )

    override fun getAnimatedShape(animatorAgeSec: Double): GeoJson {
        if (startOfLine.durationRatio() < 1) {
            startOfLine.setProgress(
                startOfLine.source + (startOfLine.distanceRemaining() * startOfLine.durationRatio()),
                animatorAgeSec
            )
        }

        if (endOfLine.durationRatio() < 1) {
            endOfLine.setProgress(
                endOfLine.source + (endOfLine.distanceRemaining() * endOfLine.durationRatio()),
                animatorAgeSec
            )
        }

        if (startOfLine.durationRatio() >= 1 && endOfLine.durationRatio() >= 1) {
            stop()
        }

        if (lineString.coordinates().count() < 2) {
            return emptyGeoJsonObj
        }

        val totalDistance = TurfMeasurement.length(lineString, UNIT_METERS)
        if (totalDistance == 0.0) {
            return emptyGeoJsonObj
        }

        if (startOfLine.progress + endOfLine.progress >= totalDistance) {
            return emptyGeoJsonObj
        }

        val trimmed = TurfMisc.lineSliceAlong(
            lineString,
            startOfLine.progress,
            totalDistance - endOfLine.progress,
            UNIT_METERS
        )
        return trimmed
    }

    fun setLineString(lineString: LineString, startOffset: Double?, endOffset: Double?) {
        this.lineString = lineString
        if (startOffset != null) {
            startOfLine.reset(
                startOffset,
                startOffset,
                startOffset,
                0.0,
                getAnimatorAgeSec()
            )
        }
        if (endOffset != null) {
            endOfLine.reset(
                endOffset,
                endOffset,
                endOffset,
                0.0,
                getAnimatorAgeSec()
            )
        }
        refresh()
    }

    fun setStartOffset(offset: Double, durationSec: Double) {
        if (durationSec == 0.0) {
            startOfLine.reset(
                offset,
                offset,
                offset,
                durationSec,
                getAnimatorAgeSec()
            )
            refresh()
        } else {
            start()
            startOfLine.reset(
                startOfLine.progress,
                startOfLine.progress,
                offset,
                durationSec,
                getAnimatorAgeSec()
            )
        }
    }

    fun setEndOffset(offset: Double, durationSec: Double) {
        if (durationSec == 0.0) {
            endOfLine.reset(
                offset,
                offset,
                offset,
                durationSec,
                getAnimatorAgeSec()
            )
            refresh()
        } else {
            start()
            endOfLine.reset(
                endOfLine.progress,
                endOfLine.progress,
                offset,
                durationSec,
                getAnimatorAgeSec()
            )
        }
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
        tag: ViewRefTag,
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

    private fun getAnimator(tag: ViewRefTag): ChangeLineOffsetsShapeAnimator {
        return shapeAnimatorManager.get(tag.toLong()) as ChangeLineOffsetsShapeAnimator
    }

    override fun setLineString(tag: ViewRefTag, coordinates: ReadableArray?, startOffset: Double, endOffset: Double, promise: Promise?) {
        val animator = getAnimator(tag)

        if (coordinates == null) {
            return
        }

        val _startOffset = if (startOffset != -1.0) startOffset else null
        val _endOffset = if (endOffset != -1.0) endOffset else null

        val lineString = buildLineString(coordinates)
        animator.setLineString(lineString, _startOffset, _endOffset)
        promise?.resolve(true)
    }

    override fun setStartOffset(tag: ViewRefTag, offset: Double, duration: Double, promise: Promise?) {
        val animator = getAnimator(tag)
        animator.setStartOffset(offset, duration / 1000)
        promise?.resolve(true)
    }

    override fun setEndOffset(tag: ViewRefTag, offset: Double, duration: Double, promise: Promise?) {
        val animator = getAnimator(tag)
        animator.setEndOffset(offset, duration / 1000)
        promise?.resolve(true)
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