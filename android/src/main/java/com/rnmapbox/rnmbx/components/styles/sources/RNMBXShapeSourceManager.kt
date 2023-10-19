package com.rnmapbox.rnmbx.components.styles.sources

import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.rnmapbox.rnmbx.components.AbstractEventEmitter
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.common.MapBuilder
import com.mapbox.bindgen.Value
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.rnmapbox.rnmbx.events.constants.EventKeys
import com.rnmapbox.rnmbx.utils.ExpressionParser
import com.rnmapbox.rnmbx.utils.Logger
import java.net.MalformedURLException
import java.net.URL
import java.util.ArrayList
import java.util.HashMap


class RNMBXShapeSourceManager(private val mContext: ReactApplicationContext) :
    AbstractEventEmitter<RNMBXShapeSource>(
        mContext
    ) {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXShapeSource {
        return RNMBXShapeSource(reactContext, this)
    }

    override fun getChildAt(source: RNMBXShapeSource, childPosition: Int): View {
        return source.getChildAt(childPosition)
    }

    override fun getChildCount(source: RNMBXShapeSource): Int {
        return source.childCount
    }

    override fun addView(source: RNMBXShapeSource, childView: View, childPosition: Int) {
        source.addLayer(childView, getChildCount(source))
    }

    override fun removeViewAt(source: RNMBXShapeSource, childPosition: Int) {
        source.removeLayer(childPosition)
    }

    @ReactProp(name = "id")
    fun setId(source: RNMBXShapeSource, id: String) {
        source.iD = id
    }

    @ReactProp(name = "existing")
    fun setExisting(source: RNMBXShapeSource, existing: Boolean) {
        source.mExisting = existing;
    }

    @ReactProp(name = "url")
    fun setURL(source: RNMBXShapeSource, urlStr: String) {
        try {
            source.setURL(URL(urlStr))
        } catch (e: MalformedURLException) {
            Logger.w(LOG_TAG, e.localizedMessage ?: "Unknown URL error")
        }
    }

    @ReactProp(name = "shape")
    fun setGeometry(source: RNMBXShapeSource, geoJSONStr: String) {
        source.setShape(geoJSONStr)
    }

    @ReactProp(name = "cluster")
    fun setCluster(source: RNMBXShapeSource, cluster: Int) {
        source.setCluster(cluster == 1)
    }

    @ReactProp(name = "clusterRadius")
    fun setClusterRadius(source: RNMBXShapeSource, radius: Int) {
        source.setClusterRadius(radius.toLong())
    }

    @ReactProp(name = "clusterMaxZoomLevel")
    fun setClusterMaxZoomLevel(source: RNMBXShapeSource, clusterMaxZoom: Int) {
        source.setClusterMaxZoom(clusterMaxZoom.toLong())
    }

    @ReactProp(name = "clusterProperties")
    fun setClusterProperties(source: RNMBXShapeSource, map: ReadableMap) {
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
    fun setMaxZoomLevel(source: RNMBXShapeSource, maxZoom: Int) {
        source.setMaxZoom(maxZoom.toLong())
    }

    @ReactProp(name = "buffer")
    fun setBuffer(source: RNMBXShapeSource, buffer: Int) {
        source.setBuffer(buffer.toLong())
    }

    @ReactProp(name = "tolerance")
    fun setTolerance(source: RNMBXShapeSource, tolerance: Double) {
        source.setTolerance(tolerance)
    }

    @ReactProp(name = "lineMetrics")
    fun setLineMetrics(source: RNMBXShapeSource, lineMetrics: Boolean) {
        source.setLineMetrics(lineMetrics)
    }

    @ReactProp(name = "hasPressListener")
    fun setHasPressListener(source: RNMBXShapeSource, hasPressListener: Boolean) {
        source.setHasPressListener(hasPressListener)
    }

    @ReactProp(name = "hitbox")
    fun setHitbox(source: RNMBXShapeSource, map: ReadableMap) {
        source.setHitbox(map)
    }

    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .put(EventKeys.SHAPE_SOURCE_LAYER_CLICK, "onMapboxShapeSourcePress")
            .put(EventKeys.MAP_ANDROID_CALLBACK, "onAndroidCallback")
            .build()
    }

    companion object {
        const val LOG_TAG = "RNMBXShapeSourceMgr"
        const val REACT_CLASS = "RNMBXShapeSource"
    }
}
