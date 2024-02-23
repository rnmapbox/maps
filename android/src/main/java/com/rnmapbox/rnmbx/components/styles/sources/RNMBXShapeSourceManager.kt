package com.rnmapbox.rnmbx.components.styles.sources

import android.view.View
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactApplicationContext
import com.rnmapbox.rnmbx.components.AbstractEventEmitter
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.ReadableType
import com.facebook.react.viewmanagers.RNMBXShapeSourceManagerInterface
import com.mapbox.bindgen.Value
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.rnmapbox.rnmbx.events.constants.EventKeys
import com.rnmapbox.rnmbx.events.constants.eventMapOf
import com.rnmapbox.rnmbx.shapeAnimators.ShapeAnimatorManager
import com.rnmapbox.rnmbx.utils.ExpressionParser
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.utils.ViewTagResolver
import java.net.MalformedURLException
import java.net.URL
import java.util.ArrayList
import java.util.HashMap


class RNMBXShapeSourceManager(private val mContext: ReactApplicationContext, val viewTagResolver: ViewTagResolver, val shapeAnimatorManager: ShapeAnimatorManager) :
    AbstractEventEmitter<RNMBXShapeSource>(
        mContext
    ), RNMBXShapeSourceManagerInterface<RNMBXShapeSource> {
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

    override fun onDropViewInstance(view: RNMBXShapeSource) {
        val reactTag = view.id

        viewTagResolver.viewRemoved(reactTag)
        super.onDropViewInstance(view)
    }

    fun tagAssigned(reactTag: Int) {
        return viewTagResolver.tagAssigned(reactTag)
    }

    @ReactProp(name = "id")
    override fun setId(source: RNMBXShapeSource, id: Dynamic) {
        source.iD = id.asString()
    }

    @ReactProp(name = "existing")
    override fun setExisting(source: RNMBXShapeSource, existing: Dynamic) {
        source.mExisting = existing.asBoolean()
    }

    @ReactProp(name = "url")
    override fun setUrl(source: RNMBXShapeSource, urlStr: Dynamic) {
        try {
            source.setURL(URL(urlStr.asString()))
        } catch (e: MalformedURLException) {
            Logger.w(LOG_TAG, e.localizedMessage ?: "Unknown URL error")
        }
    }

    @ReactProp(name = "shape")
    override fun setShape(source: RNMBXShapeSource, geoJSONStr: Dynamic) {
        source.setShape(geoJSONStr.asString())
    }

    @ReactProp(name = "cluster")
    override fun setCluster(source: RNMBXShapeSource, cluster: Dynamic) {
        source.setCluster(cluster.asInt() == 1)
    }

    @ReactProp(name = "clusterRadius")
    override fun setClusterRadius(source: RNMBXShapeSource, radius: Dynamic) {
        source.setClusterRadius(radius.asInt().toLong())
    }

    @ReactProp(name = "clusterMaxZoomLevel")
    override fun setClusterMaxZoomLevel(source: RNMBXShapeSource, clusterMaxZoom: Dynamic) {
        source.setClusterMaxZoom(clusterMaxZoom.asInt().toLong())
    }

    @ReactProp(name = "clusterProperties")
    override fun setClusterProperties(source: RNMBXShapeSource, map: Dynamic) {
        val properties = HashMap<String, Any>()
        val iterator = map.asMap().keySetIterator()
        while (iterator.hasNextKey()) {
            val name = iterator.nextKey()
            val expressions = map.asMap().getArray(name)
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
    override fun setMaxZoomLevel(source: RNMBXShapeSource, maxZoom: Dynamic) {
        source.setMaxZoom(maxZoom.asInt().toLong())
    }

    @ReactProp(name = "buffer")
    override fun setBuffer(source: RNMBXShapeSource, buffer: Dynamic) {
        source.setBuffer(buffer.asInt().toLong())
    }

    @ReactProp(name = "tolerance")
    override fun setTolerance(source: RNMBXShapeSource, tolerance: Dynamic) {
        source.setTolerance(tolerance.asDouble())
    }

    @ReactProp(name = "lineMetrics")
    override fun setLineMetrics(source: RNMBXShapeSource, lineMetrics: Dynamic) {
        source.setLineMetrics(lineMetrics.asBoolean())
    }

    @ReactProp(name = "hasPressListener")
    override fun setHasPressListener(source: RNMBXShapeSource, hasPressListener: Dynamic) {
        source.setHasPressListener(hasPressListener.asBoolean())
    }

    @ReactProp(name = "hitbox")
    override fun setHitbox(source: RNMBXShapeSource, map: Dynamic) {
        source.setHitbox(map.asMap())
    }

    override fun customEvents(): Map<String, String>? {
        return eventMapOf(
            EventKeys.SHAPE_SOURCE_LAYER_CLICK to "onMapboxShapeSourcePress",
            EventKeys.MAP_ANDROID_CALLBACK to "onAndroidCallback"
        )
    }

    companion object {
        const val LOG_TAG = "RNMBXShapeSourceMgr"
        const val REACT_CLASS = "RNMBXShapeSource"
    }
}
