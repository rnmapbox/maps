package com.mapbox.rctmgl.components.styles.sources

import android.util.Log
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.mapbox.rctmgl.components.AbstractEventEmitter
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableType
import com.facebook.react.common.MapBuilder
import com.mapbox.bindgen.Value
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.rctmgl.events.constants.EventKeys
import com.mapbox.rctmgl.utils.ExpressionParser
import com.mapbox.rctmgl.utils.Logger
import java.net.MalformedURLException
import java.net.URL
import java.util.ArrayList
import java.util.HashMap


class RCTMGLShapeSourceManager(private val mContext: ReactApplicationContext) :
    AbstractEventEmitter<RCTMGLShapeSource>(
        mContext
    ) {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLShapeSource {
        return RCTMGLShapeSource(reactContext, this)
    }

    override fun getChildAt(source: RCTMGLShapeSource, childPosition: Int): View {
        return source.getChildAt(childPosition)
    }

    override fun getChildCount(source: RCTMGLShapeSource): Int {
        return source.childCount
    }

    override fun addView(source: RCTMGLShapeSource, childView: View, childPosition: Int) {
        source.addLayer(childView, getChildCount(source))
    }

    override fun removeViewAt(source: RCTMGLShapeSource, childPosition: Int) {
        source.removeLayer(childPosition)
    }

    @ReactProp(name = "id")
    fun setId(source: RCTMGLShapeSource, id: String) {
        source.iD = id
    }

    @ReactProp(name = "existing")
    fun setExisting(source: RCTMGLShapeSource, existing: Boolean) {
        source.mExisting = existing;
    }

    @ReactProp(name = "url")
    fun setURL(source: RCTMGLShapeSource, urlStr: String) {
        try {
            source.setURL(URL(urlStr))
        } catch (e: MalformedURLException) {
            Logger.w(LOG_TAG, e.localizedMessage ?: "Unknown URL error")
        }
    }

    @ReactProp(name = "shape")
    fun setGeometry(source: RCTMGLShapeSource, geoJSONStr: String) {
        source.setShape(geoJSONStr)
    }

    @ReactProp(name = "cluster")
    fun setCluster(source: RCTMGLShapeSource, cluster: Int) {
        source.setCluster(cluster == 1)
    }

    @ReactProp(name = "clusterRadius")
    fun setClusterRadius(source: RCTMGLShapeSource, radius: Int) {
        source.setClusterRadius(radius.toLong())
    }

    @ReactProp(name = "clusterMaxZoomLevel")
    fun setClusterMaxZoomLevel(source: RCTMGLShapeSource, clusterMaxZoom: Int) {
        source.setClusterMaxZoom(clusterMaxZoom.toLong())
    }

    @ReactProp(name = "clusterProperties")
    fun setClusterProperties(source: RCTMGLShapeSource, map: ReadableMap) {
        val properties = HashMap<String, Any>()
        val iterator = map.keySetIterator()
        while (iterator.hasNextKey()) {
            val name = iterator.nextKey()
            val expressions = map.getArray(name)
            val builder: MutableList<Value> = ArrayList()
            for (iExp in 0 until expressions!!.size()) {
                var argument: Expression
                argument = when (expressions.getType(iExp)) {
                    ReadableType.Array -> ExpressionParser.from(
                        expressions.getArray(iExp)
                    )!!
                    ReadableType.Map -> ExpressionParser.from(
                        expressions.getMap(iExp)
                    )
                    ReadableType.Boolean -> Expression.literal(expressions.getBoolean(iExp))
                    ReadableType.Number -> Expression.literal(expressions.getDouble(iExp))
                    else -> Expression.literal(expressions.getString(iExp))
                }
                builder.add(argument)
            }
            properties[name] = Value(builder)
        }
        source.setClusterProperties(properties)
    }

    @ReactProp(name = "maxZoomLevel")
    fun setMaxZoomLevel(source: RCTMGLShapeSource, maxZoom: Int) {
        source.setMaxZoom(maxZoom.toLong())
    }

    @ReactProp(name = "buffer")
    fun setBuffer(source: RCTMGLShapeSource, buffer: Int) {
        source.setBuffer(buffer.toLong())
    }

    @ReactProp(name = "tolerance")
    fun setTolerance(source: RCTMGLShapeSource, tolerance: Double) {
        source.setTolerance(tolerance)
    }

    @ReactProp(name = "lineMetrics")
    fun setLineMetrics(source: RCTMGLShapeSource, lineMetrics: Boolean) {
        source.setLineMetrics(lineMetrics)
    }

    @ReactProp(name = "hasPressListener")
    fun setHasPressListener(source: RCTMGLShapeSource, hasPressListener: Boolean) {
        source.setHasPressListener(hasPressListener)
    }

    @ReactProp(name = "hitbox")
    fun setHitbox(source: RCTMGLShapeSource, map: ReadableMap) {
        source.setHitbox(map)
    }

    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .put(EventKeys.SHAPE_SOURCE_LAYER_CLICK, "onMapboxShapeSourcePress")
            .put(EventKeys.MAP_ANDROID_CALLBACK, "onAndroidCallback")
            .build()
    }

    override fun getCommandsMap(): Map<String, Int>? {
        return MapBuilder.builder<String, Int>()
            .put("features", METHOD_FEATURES)
            .put("getClusterExpansionZoom", METHOD_GET_CLUSTER_EXPANSION_ZOOM)
            .put("getClusterLeaves", METHOD_GET_CLUSTER_LEAVES)
            .put("getClusterChildren", METHOD_GET_CLUSTER_CHILDREN)
            .build()
    }

    override fun receiveCommand(source: RCTMGLShapeSource, commandID: Int, args: ReadableArray?) {
        if (args == null) {
            return
        }

        val callbackID = args.getString(0);

        when (commandID) {
            METHOD_FEATURES -> source.querySourceFeatures(
                callbackID,
                ExpressionParser.from(args.getArray(1))
            )
            METHOD_GET_CLUSTER_EXPANSION_ZOOM -> source.getClusterExpansionZoom(
                callbackID,
                args.getString(1)
            )
            METHOD_GET_CLUSTER_LEAVES -> source.getClusterLeaves(
                callbackID,
                args.getString(1),
                args.getInt(2),
                args.getInt(3)
            )
            METHOD_GET_CLUSTER_CHILDREN -> source.getClusterChildren(
                callbackID,
                args.getString(1)
            )
        }
    }

    companion object {
        const val LOG_TAG = "RCTMGLShapeSourceMgr"
        const val REACT_CLASS = "RCTMGLShapeSource"

        //region React Methods
        const val METHOD_FEATURES = 103
        const val METHOD_GET_CLUSTER_EXPANSION_ZOOM = 104
        const val METHOD_GET_CLUSTER_LEAVES = 105
        const val METHOD_GET_CLUSTER_CHILDREN = 106
    }
}
