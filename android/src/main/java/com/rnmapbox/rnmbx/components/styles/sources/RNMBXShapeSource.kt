package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import com.mapbox.maps.extension.style.sources.generated.GeoJsonSource
import com.rnmapbox.rnmbx.utils.ImageEntry
import android.graphics.drawable.BitmapDrawable
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.events.FeatureClickEvent
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.mapbox.bindgen.Value
import com.mapbox.geojson.Feature
import com.rnmapbox.rnmbx.events.AndroidCallbackEvent
import com.mapbox.geojson.FeatureCollection
import com.mapbox.geojson.LineString
import com.mapbox.geojson.Point
import com.mapbox.maps.*
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.rnmbx.utils.Logger
import com.mapbox.turf.TurfConstants
import com.mapbox.turf.TurfMeasurement
import com.mapbox.turf.TurfMisc
import org.json.JSONObject
import com.rnmapbox.rnmbx.utils.Logger
import java.net.URL
import java.util.ArrayList
import java.util.HashMap
import java.util.Timer
import java.util.TimerTask

import com.rnmapbox.rnmbx.v11compat.feature.*

class RNMBXShapeSource(context: Context, private val mManager: RNMBXShapeSourceManager) :
    RNMBXSource<GeoJsonSource>(context) {
    private var mURL: URL? = null
    private var mShape: String? = null
    private var mStartOffset: Double? = null
    private var mEndffset: Double? = null
    private var mAnimationDuration: Long? = null
    private var mSnapIfDistanceIsGreaterThan: Long? = null
    private var mCluster: Boolean? = null
    private var mClusterRadius: Long? = null
    private var mClusterMaxZoom: Long? = null
    private var mClusterProperties: HashMap<String, Any>? = null
    private var mMaxZoom: Long? = null
    private var mBuffer: Long? = null
    private var mTolerance: Double? = null
    private var mLineMetrics: Boolean? = null

    private var mShapeLastUpdatedPoint: Point? = null
    private var mCurrentLineStartOffset: Double = 0.0
    private var mCurrentLineEndOffset: Double = 0.0
    private var mTimer: Timer? = null

    override fun hasNoDataSoRefersToExisting(): Boolean {
        return (mURL == null) && (mShape == null)
    }

    override fun addToMap(mapView: RNMBXMapView) {
        // Wait for style before adding the source to the map
        mapView.getMapboxMap().getStyle {
            val map = mapView.getMapboxMap()
            super@RNMBXShapeSource.addToMap(mapView)
        }
    }

    override fun setId(id: Int) {
        super.setId(id)
        mManager.tagAssigned(id)
    }

    override fun makeSource(): GeoJsonSource {
        val builder = GeoJsonSource.Builder(iD.toString())
        getOptions(builder)
        builder.data(mShape ?: mURL.toString())
        return builder.build()
    }

    fun setURL(url: URL) {
        mURL = url
        if (mSource != null && mMapView != null && !mMapView!!.isDestroyed) {
            mSource!!.data(mURL.toString())
        }
    }

    fun setShape(shape: String) {
        mShape = shape
        val type = getGeoJSONType(shape)
        if (type == ShapeType.FEATURE_COLLECTION || type == ShapeType.FEATURE || type == ShapeType.GEOMETRY) {
            if (mSource != null && mMapView != null && !mMapView!!.isDestroyed) {
                mSource!!.data(mShape!!)
                val value = Value.valueOf(mShape!!)
                mMap!!.getStyle()!!.setStyleSourceProperty(iD!!, "data", value)
            }
        } else if (type == ShapeType.LINESTRING) {
            mTimer?.cancel()
            mCurrentLineStartOffset = 0.0
            mCurrentLineEndOffset = 0.0
            val targetLine = getGeometryAsLine(shape)
            applyGeometryFromLine(targetLine)
        } else if (type == ShapeType.POINT) {
            val targetPoint = getGeometryAsPoint(shape)
            if (mShapeLastUpdatedPoint == null) {
                mShapeLastUpdatedPoint = targetPoint
            }
            val prevPoint = mShapeLastUpdatedPoint ?: targetPoint
            if (prevPoint != null && targetPoint != null) {
                animateToNewPoint(prevPoint, targetPoint)
            }
        }
    }

    fun setLineStartOffset(startOffset: Float) {
        mStartOffset = startOffset.toDouble()
        animateToNewLineStartOffset(mCurrentLineStartOffset, mStartOffset)
    }

    fun setLineEndOffset(endOffset: Float) {
        mEndffset = endOffset.toDouble()
        animateToNewLineStartOffset(mCurrentLineEndOffset, mEndffset)
    }

    fun setAnimationDuration(animationDuration: Float) {
        mAnimationDuration = animationDuration.toLong()
    }

    fun setSnapIfDistanceIsGreaterThan(distance: Float) {
        mSnapIfDistanceIsGreaterThan = distance.toLong()
    }

    fun setCluster(cluster: Boolean) {
        mCluster = cluster
    }

    fun setClusterRadius(clusterRadius: Long) {
        mClusterRadius = clusterRadius
    }

    fun setClusterMaxZoom(clusterMaxZoom: Long) {
        mClusterMaxZoom = clusterMaxZoom
        if (mSource != null && mMapView != null && !mMapView!!.isDestroyed) {
            val result = mMap!!.getStyle()!!
                .setStyleSourceProperty(iD!!, "clusterMaxZoom", Value.valueOf(clusterMaxZoom))
        }
    }

    fun setClusterProperties(clusterProperties: HashMap<String, Any>) {
        mClusterProperties = clusterProperties
    }

    fun setMaxZoom(maxZoom: Long) {
        mMaxZoom = maxZoom
    }

    fun setBuffer(buffer: Long) {
        mBuffer = buffer
    }

    fun setTolerance(tolerance: Double) {
        mTolerance = tolerance
    }

    fun setLineMetrics(lineMetrics: Boolean) {
        mLineMetrics = lineMetrics
    }

    private fun getGeometryAsPoint(pointStr: String?): Point? {
        val _pointStr = pointStr ?: return null
        var point: Point? = null

        try {
            point = Point.fromJson(_pointStr)
        } catch (_: Exception) {
            try {
                val feature = Feature.fromJson(_pointStr)
                point = feature.geometry() as Point
            } catch (_: Exception) {}
        }

        return point
    }

    private fun applyGeometryFromPoint(currentPoint: Point?) {
        val _mSource = mSource ?: return
        val _style = mMap?.getStyle()

        if (mMapView == null || mMapView?.isDestroyed == true || _style == null || currentPoint == null) {
            return
        }

        mShapeLastUpdatedPoint = currentPoint

        _mSource.geometry(currentPoint)
    }

    private fun animateToNewPoint(prevPoint: Point, targetPoint: Point) {
        mTimer?.cancel()

        val lineBetween = LineString.fromLngLats(
            listOf<Point>(
                prevPoint,
                targetPoint
            )
        )
        val distanceBetween = TurfMeasurement.length(lineBetween, TurfConstants.UNIT_METERS)

        val _mSnapThreshold = mSnapIfDistanceIsGreaterThan?.toLong()
        if (_mSnapThreshold != null && distanceBetween > _mSnapThreshold) {
            applyGeometryFromPoint(targetPoint)
            return
        }

        val _mAnimationDuration = mAnimationDuration?.toLong()
        if (_mAnimationDuration == null || _mAnimationDuration <= 0) {
            applyGeometryFromPoint(targetPoint)
            return
        }

        val fps = 30.0
        var ratio = 0.0

        val durationSec = _mAnimationDuration.toDouble() / 1000.0
        val ratioIncr = 1.0 / (fps * durationSec)
        val period = 1000.0 / fps

        mTimer = Timer()
        mTimer?.scheduleAtFixedRate(
            object : TimerTask() {
                override fun run() {
                    runOnUiThread {
                        ratio += ratioIncr
                        if (ratio >= 1) {
                            mTimer?.cancel()
                            return@runOnUiThread
                        }

                        val point = TurfMeasurement.along(
                            lineBetween,
                            distanceBetween * ratio,
                            TurfConstants.UNIT_METERS
                        )
                        applyGeometryFromPoint(point)
                    }
                }
            }, 0, period.toLong()
        )
    }

    private fun getGeometryAsLine(lineStr: String?): LineString? {
        val _lineStr = lineStr ?: return null
        var line: LineString? = null

        try {
            line = LineString.fromJson(_lineStr)
        } catch (_: Exception) {
            try {
                val feature = Feature.fromJson(_lineStr)
                line = feature.geometry() as LineString
            } catch (_: Exception) {}
        }

        return line
    }

    fun applyGeometryFromLine(currentLine: LineString?) {
        val _mSource = mSource ?: return
        val _style = mMap?.getStyle()

        if (currentLine == null || mMapView == null || mMapView?.isDestroyed == true || _style == null) {
            return
        }

        val length = TurfMeasurement.length(currentLine, TurfConstants.UNIT_METERS)
        val geometryTrimmed = TurfMisc.lineSliceAlong(
            currentLine,
            mCurrentLineStartOffset,
            length - mCurrentLineEndOffset,
            TurfConstants.UNIT_METERS
        )

        _mSource.geometry(geometryTrimmed)
    }

    fun animateToNewLineStartOffset(prevOffset: Double, targetOffset: Double?) {
        val targetOffset = targetOffset ?: return

        mTimer?.cancel()

        val _mAnimationDuration = mAnimationDuration
        if (_mAnimationDuration == null || _mAnimationDuration <= 0) {
            val lineString = getGeometryAsLine(mShape)
            applyGeometryFromLine(lineString)
            return
        }

        val fps = 30.0
        var ratio = 0.0

        val durationSec = _mAnimationDuration.toDouble() / 1000.0
        val ratioIncr = 1.0 / (fps * durationSec)
        val period = 1000.0 / fps

        mTimer = Timer()
        mTimer?.scheduleAtFixedRate(
            object : TimerTask() {
                override fun run() {
                    runOnUiThread {
                        ratio += ratioIncr
                        if (ratio >= 1) {
                            mTimer?.cancel()
                            return@runOnUiThread
                        }

                        val progress = (targetOffset - prevOffset) * ratio
                        mCurrentLineStartOffset = prevOffset + progress

                        val lineString = getGeometryAsLine(mShape)
                        applyGeometryFromLine(lineString)
                    }
                }
            }, 0, period.toLong()
        )
    }

    fun animateToNewLineEndOffset(prevOffset: Double, targetOffset: Double?) {
        Log.d("RCTMGLShapeSource", "animateToNewLineEndOffset is not implemented")
    }

    enum class ShapeType {
        GEOMETRY, LINESTRING, POINT, FEATURE, FEATURE_COLLECTION, URL, UNKNOWN
    }

    fun getGeoJSONType(geoJSONStr: String?): ShapeType {
        if (geoJSONStr == null) {
            return ShapeType.UNKNOWN
        }

        val obj = JSONObject(geoJSONStr)
        val type = obj.getString("type")
        var geometryType: String? = null;
        if (obj.has("geometry")) {
            geometryType = obj.getJSONObject("geometry").getString("type")
        }

        if (type == "Point" || geometryType == "Point") {
            return ShapeType.POINT
        } else if (type == "LineString" || geometryType == "LineString") {
            return ShapeType.LINESTRING
        } else if (type == "FeatureCollection") {
            return ShapeType.FEATURE_COLLECTION
        } else if (type == "Feature") {
            return ShapeType.FEATURE
        } else {
            return ShapeType.UNKNOWN
        }
    }

    override fun onPress(event: OnPressEvent?) {
        mManager.handleEvent(FeatureClickEvent.makeShapeSourceEvent(this, event))
    }

    private fun getOptions(builder: GeoJsonSource.Builder) {
        if (mCluster != null) {
            builder.cluster(mCluster!!)
        }
        if (mClusterRadius != null) {
            builder.clusterRadius(mClusterRadius!!)
        }
        if (mClusterMaxZoom != null) {
            builder.clusterMaxZoom(mClusterMaxZoom!!)
        }
        if (mClusterProperties != null) {
            builder.clusterProperties(mClusterProperties!!)
        }
        if (mMaxZoom != null) {
            builder.maxzoom(mMaxZoom!!)
        }
        if (mBuffer != null) {
            builder.buffer(mBuffer!!)
        }
        if (mTolerance != null) {
            builder.tolerance(mTolerance!!)
        }
        if (mLineMetrics != null) {
            builder.lineMetrics(mLineMetrics!!)
        }
    }

    fun querySourceFeatures(
        callbackID: String,
        filter: Expression?
    ) {
        if (mSource == null) {
            val payload: WritableMap = WritableNativeMap()
            payload.putString("error", "source is not yet loaded")
            val event = AndroidCallbackEvent(this, callbackID, payload)
            mManager.handleEvent(event)
            return
        }
        val _this = this
        mMap!!.querySourceFeatures(
            iD!!, SourceQueryOptions(
                null,  // v10todo
                filter!!
            )
        ) { features ->
            if (features.isError) {
                Logger.e("RNMBXShapeSource", String.format("Error: %s", features.error))
            } else {
                val payload: WritableMap = WritableNativeMap()
                val result: MutableList<Feature> = ArrayList(
                    features.value!!.size
                )
                for (i in features.value!!) {
                    result.add(i.feature)
                }
                payload.putString("data", FeatureCollection.fromFeatures(result).toJson())
                val event = AndroidCallbackEvent(_this, callbackID, payload)
                mManager.handleEvent(event)
            }
        }
    }

    private fun callbackSuccess(payload: WritableMap, promise: Promise) {
        promise.resolve(payload)
    }
    private fun callbackError(error: String, where: String, promise: Promise) {
        promise.reject("error", "$where: $error")
    }

    fun getClusterExpansionZoom(featureJSON: String, promise: Promise) {
        val feature = Feature.fromJson(featureJSON)

        mMap!!.getGeoJsonClusterExpansionZoom(iD!!, feature, QueryFeatureExtensionCallback { features ->
            if (features.isValue) {
                val contents = features.value!!.value!!.contents
                val payload: WritableMap = WritableNativeMap()

                if (contents is Long) {
                    val payload: WritableMap = WritableNativeMap()
                    payload.putInt("data", contents.toInt())
                    callbackSuccess(payload, promise)
                    return@QueryFeatureExtensionCallback
                } else {
                    callbackError(

                        "Not a number: $contents",
                        "getClusterExpansionZoom/getGeoJsonClusterExpansionZoom",
                        promise
                    )
                    return@QueryFeatureExtensionCallback
                }
            } else {
                callbackError(
                    features.error ?: "Unknown error",
                    "getClusterExpansionZoom/getGeoJsonClusterExpansionZoom",
                    promise
                )
                return@QueryFeatureExtensionCallback
            }
        })
    }

    fun getClusterLeaves(featureJSON: String, number: Int, offset: Int, promise: Promise) {
        val feature = Feature.fromJson(featureJSON)

        val _this = this
        mMap!!.getGeoJsonClusterLeaves(iD!!, feature, number.toLong(), offset.toLong(), QueryFeatureExtensionCallback { features ->
            if (features.isValue) {
                val leaves = features.value!!
                    .featureCollection
                val payload: WritableMap = WritableNativeMap()
                payload.putString(
                    "data",
                    FeatureCollection.fromFeatures(leaves!!).toJson()
                )
                callbackSuccess(payload, promise)
            } else {
                callbackError(
                    features.error ?: "Unknown error",
                    "getClusterLeaves/getGeoJsonClusterLeaves",
                    promise
                )
                return@QueryFeatureExtensionCallback
            }
        })
    }

    fun getClusterChildren(featureJSON: String, promise: Promise) {
        val feature = Feature.fromJson(featureJSON)

        val _this = this
        mMap!!.getGeoJsonClusterChildren(iD!!, feature, QueryFeatureExtensionCallback { features ->
            if (features.isValue) {
                val children = features.value!!
                    .featureCollection
                val payload: WritableMap = WritableNativeMap()
                payload.putString(
                    "data",
                    FeatureCollection.fromFeatures(children!!).toJson()
                )
                callbackSuccess(payload, promise)
            }else {
                callbackError(
                    features.error ?: "Unknown error",
                    "getClusterLeaves/queryFeatureExtensions",
                    promise
                )
                return@QueryFeatureExtensionCallback
            }
        })
    }

    /*companion object {
        private val mImagePlaceholder: Bitmap? = null
    }*/
}