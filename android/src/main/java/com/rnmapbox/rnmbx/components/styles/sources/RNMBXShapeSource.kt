package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import com.mapbox.maps.extension.style.sources.generated.GeoJsonSource
import com.rnmapbox.rnmbx.utils.ImageEntry
import android.graphics.drawable.BitmapDrawable
import com.facebook.react.bridge.ReadableMap
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.events.FeatureClickEvent
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.mapbox.bindgen.Value
import com.mapbox.geojson.Feature
import com.rnmapbox.rnmbx.events.AndroidCallbackEvent
import com.mapbox.geojson.FeatureCollection
import com.mapbox.maps.*
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.rnmapbox.rnmbx.utils.Logger
import java.net.URL
import java.util.ArrayList
import java.util.HashMap

import com.rnmapbox.rnmbx.v11compat.feature.*

class RNMBXShapeSource(context: Context, private val mManager: RNMBXShapeSourceManager) :
    RNMBXSource<GeoJsonSource>(context) {
    private var mURL: URL? = null
    private var mShape: String? = null
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
        if (mSource != null && mMapView != null && !mMapView!!.isDestroyed) {
            mSource!!.data(mShape!!)
            val result = mMap!!.getStyle()!!
                .setStyleSourceProperty(iD!!, "data", Value.valueOf(mShape!!))
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
