package com.mapbox.rctmgl.components.styles.sources

import android.content.Context
import com.mapbox.maps.extension.style.sources.generated.GeoJsonSource
import com.mapbox.rctmgl.utils.ImageEntry
import android.graphics.drawable.BitmapDrawable
import android.util.Log
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.events.FeatureClickEvent
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.mapbox.bindgen.Value
import com.mapbox.geojson.Feature
import com.mapbox.rctmgl.events.AndroidCallbackEvent
import com.mapbox.geojson.FeatureCollection
import com.mapbox.geojson.LineString
import com.mapbox.geojson.Point
import com.mapbox.maps.*
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.rctmgl.utils.Logger
import com.mapbox.turf.TurfConstants
import com.mapbox.turf.TurfMeasurement
import org.json.JSONObject
import java.net.URL
import java.util.ArrayList
import java.util.HashMap
import java.util.Timer
import java.util.TimerTask

class RCTMGLShapeSource(context: Context, private val mManager: RCTMGLShapeSourceManager): RCTSource<GeoJsonSource>(context) {
    private var mURL: URL? = null
    private var mShape: String? = null
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
    private val mImages: List<Map.Entry<String, ImageEntry>>? = null
    private val mNativeImages: List<Map.Entry<String, BitmapDrawable>>? = null

    private var mShapePointCache: String? = null
    private var mShapeLastUpdatedPointCache: Point? = null
    private var mTimer: Timer? = null

    override fun hasNoDataSoRefersToExisting(): Boolean {
        return (mURL == null) && (mShape == null)
    }

    override fun addToMap(mapView: RCTMGLMapView) {
        // Wait for style before adding the source to the map
        mapView.getMapboxMap().getStyle {
            val map = mapView.getMapboxMap()
            super@RCTMGLShapeSource.addToMap(mapView)
        }
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

    fun setShape(geoJSONStr: String) {
        mShape = geoJSONStr
        val obj = JSONObject(geoJSONStr)
        val type = obj.get("type")

        if (type == "Point") {
            val targetPoint = getGeometryAsPoint(geoJSONStr)
            val _prevPoint = mShapeLastUpdatedPointCache ?: targetPoint
            val _targetPoint = targetPoint

            if (_prevPoint != null && _targetPoint != null) {
                animateToNewPoint(_prevPoint, _targetPoint)
            }
        } else if (type == "LineString") {
            Log.d("[ShapeSource]", "TODO: LineString not yet implemented")
        } else {
            if (mSource != null && mMapView != null && !mMapView!!.isDestroyed) {
                mSource!!.data(mShape!!)
                val value = Value.valueOf(mShape!!)
                mMap!!.getStyle()!!.setStyleSourceProperty(iD!!, "data", value)
            }
        }
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

    private fun getGeometryAsPoint(pointStr: String): Point? {
        val _pointStr = pointStr ?: return null
        val geometry = Point.fromJson(_pointStr)
        return geometry
    }

    private fun applyGeometryFromPoint(currentPoint: Point?) {
        val _mSource = mSource ?: return
        val _style = mMap?.getStyle()

        if (mMapView == null || mMapView?.isDestroyed == true || _style == null || currentPoint == null) {
            return
        }

        mShapeLastUpdatedPointCache = currentPoint

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
        if( _mSnapThreshold != null && distanceBetween > _mSnapThreshold) {
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
                Logger.e("RCTMGLShapeSource", String.format("Error: %s", features.error))
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

    private fun callbackSuccess(callbackID: String, payload: WritableMap) {
        val event = AndroidCallbackEvent(this, callbackID, payload)
        mManager.handleEvent(event)
    }
    private fun callbackError(callbackID: String, error: String, where: String) {
        val payload: WritableMap = WritableNativeMap()
        payload.putString("error", "$where: $error")
        val event = AndroidCallbackEvent(this, callbackID, payload)
        mManager.handleEvent(event)
    }

    fun getClusterExpansionZoom(callbackID: String, featureJSON: String) {
        val feature = Feature.fromJson(featureJSON)

        mMap!!.getGeoJsonClusterExpansionZoom(iD!!, feature, QueryFeatureExtensionCallback { features ->
            if (features.isValue) {
                val contents = features.value!!.value!!.contents
                val payload: WritableMap = WritableNativeMap()

                if (contents is Long) {
                    val payload: WritableMap = WritableNativeMap()
                    payload.putInt("data", contents.toInt())
                    callbackSuccess(callbackID, payload)
                    return@QueryFeatureExtensionCallback
                } else {
                    callbackError(
                        callbackID,
                        "Not a number: $contents",
                        "getClusterExpansionZoom/getGeoJsonClusterExpansionZoom"
                    )
                    return@QueryFeatureExtensionCallback
                }
            } else {
                callbackError(
                    callbackID,
                    features.error ?: "Unknown error",
                    "getClusterExpansionZoom/getGeoJsonClusterExpansionZoom"
                )
                return@QueryFeatureExtensionCallback
            }
        })
    }

    fun getClusterLeaves(callbackID: String, featureJSON: String, number: Int, offset: Int) {
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
                callbackSuccess(callbackID, payload)
            } else {
                callbackError(
                    callbackID,
                    features.error ?: "Unknown error",
                    "getClusterLeaves/getGeoJsonClusterLeaves"
                )
                return@QueryFeatureExtensionCallback
            }
        })
    }

    fun getClusterChildren(callbackID: String, featureJSON: String) {
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
                callbackSuccess(callbackID, payload)
            }else {
                callbackError(
                    callbackID,
                    features.error ?: "Unknown error",
                    "getClusterLeaves/queryFeatureExtensions"
                )
                return@QueryFeatureExtensionCallback
            }
        })
    }

    /*companion object {
        private val mImagePlaceholder: Bitmap? = null
    }*/
}
