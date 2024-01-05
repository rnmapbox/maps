package com.rnmapbox.rnmbx.shape_animators

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.mapbox.geojson.GeoJson
import com.mapbox.geojson.LineString
import com.mapbox.geojson.Point
import com.rnmapbox.rnmbx.NativeRNMBXChangeLineOffsetsShapeAnimatorModuleSpec

class ChangeLineOffsetsShapeAnimator(tag: Tag, lineString: LineString, startOffset: Double, endOffset: Double): ShapeAnimatorCommon(tag) {
    override fun getAnimatedShape(currentTimestamp: Long): Pair<GeoJson, Boolean> {
        return Pair(
            Point.fromLngLat(0.0, 0.0), // TODO
            true
        );
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

    @ReactMethod
    override fun start(tag: Double, promise: Promise?) {
        shapeAnimatorManager.get(tag.toLong())?.start()
    }

    override fun setLineString(tag: Double, coordinates: ReadableArray?, promise: Promise?) {
        TODO("Not yet implemented")
    }

    override fun setStartOffset(tag: Double, offset: Double, duration: Double, promise: Promise?) {
        TODO("Not yet implemented")
    }

    override fun setEndOffset(tag: Double, offset: Double, duration: Double, promise: Promise?) {
        TODO("Not yet implemented")
    }
}

private fun buildLineString(_coordinates: ReadableArray): LineString {
    val coordinates: List<Point> = listOf() // TODO
//    let coordinates = _coordinates.map { coord in
//            let coord = coord as! [NSNumber]
//        return LocationCoordinate2D(latitude: coord[1].doubleValue, longitude: coord[0].doubleValue)
//    }

    return LineString.fromLngLats(coordinates)
}