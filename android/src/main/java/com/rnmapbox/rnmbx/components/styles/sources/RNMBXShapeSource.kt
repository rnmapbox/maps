package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.mapbox.bindgen.Value
import com.mapbox.geojson.Feature
import com.mapbox.geojson.FeatureCollection
import com.mapbox.geojson.GeoJson
import com.mapbox.geojson.Geometry
import com.mapbox.maps.*
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.sources.generated.GeoJsonSource
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.events.AndroidCallbackEvent
import com.rnmapbox.rnmbx.events.FeatureClickEvent
import com.rnmapbox.rnmbx.shapeAnimators.ShapeAnimationConsumer
import com.rnmapbox.rnmbx.shapeAnimators.ShapeAnimator
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.v11compat.feature.*
import java.net.URL

private const val LOG_TAG = "RNMBXShapeSource"

class RNMBXShapeSource(context: Context, private val mManager: RNMBXShapeSourceManager) :
    RNMBXSource<GeoJsonSource>(context), ShapeAnimationConsumer {
    private var mURL: URL? = null
    private var mShape: String? = null
    private var mShapeAnimator: ShapeAnimator? = null
    private var mCluster: Boolean? = null
    private var mClusterRadius: Long? = null
    private var mClusterMaxZoom: Long? = null
    private var mClusterProperties: HashMap<String, Any>? = null
    private var mMaxZoom: Long? = null
    private var mBuffer: Long? = null
    private var mTolerance: Double? = null
    private var mLineMetrics: Boolean? = null

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

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {

        if (reason == RemovalReason.VIEW_REMOVAL) {
            mShapeAnimator?.unsubscribe(this)
        }
        return super.removeFromMap(mapView, reason)
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

    fun setShape(geoJSONStr: String) {
        mShapeAnimator?.unsubscribe(this)
        mShapeAnimator = null

        val shapeAnimatorManager = mManager.shapeAnimatorManager
        if (shapeAnimatorManager.isShapeAnimatorTag(geoJSONStr)) {
            shapeAnimatorManager.get(geoJSONStr)?.let { shapeAnimator ->
                mShapeAnimator = shapeAnimator
                shapeAnimator.subscribe(this)

                val shape = shapeAnimator.getShape()
                shapeUpdated(shape)
            }
        } else {
            mShape = geoJSONStr
            if (mSource != null && mMapView != null && !mMapView!!.isDestroyed) {
                mSource!!.data(mShape!!)
                val result = mMap!!.getStyle()!!
                    .setStyleSourceProperty(iD!!, "data", Value.valueOf(mShape!!))
            }
        }
    }

    private fun toGeoJSONSourceData(geoJson: GeoJson): GeoJSONSourceData? {
        return when (geoJson) {
            is Geometry ->
                GeoJSONSourceData(geoJson)
            is Feature ->
                GeoJSONSourceData(geoJson)
            is FeatureCollection ->
                GeoJSONSourceData(geoJson.features() ?: listOf())
            else -> {
                Logger.e(
                    LOG_TAG,
                    "Cannot convert shape to Geometry, Feature, or FeatureCollection: $geoJson"
                )
                return null
            }
        }
    }
    override fun shapeUpdated(geoJson: GeoJson) {
        mSource?.also {
            if (mSource != null && mMapView != null && !mMapView!!.isDestroyed) {
                toGeoJSONSourceData(geoJson)?.let {
                    mMap?.getStyle()?.setStyleGeoJSONSourceData(iD!!,
                        "animated-shape",
                        it)
                }
            }
        } ?: run {
            mShape = geoJson.toJson()
        }
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
                Logger.e(LOG_TAG, String.format("Error: %s", features.error))
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
