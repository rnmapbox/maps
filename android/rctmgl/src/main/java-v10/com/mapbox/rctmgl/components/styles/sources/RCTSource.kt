package com.mapbox.rctmgl.components.styles.sources

import android.content.Context
import com.mapbox.maps.extension.style.sources.getSource
import com.mapbox.maps.extension.style.sources.addSource
import com.mapbox.rctmgl.components.AbstractMapFeature
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.maps.MapboxMap
import com.mapbox.rctmgl.components.styles.sources.AbstractSourceConsumer
import com.facebook.react.bridge.ReadableMap
import com.mapbox.rctmgl.components.styles.sources.RCTSource
import android.graphics.PointF
import android.view.View
import com.facebook.react.common.MapBuilder
import com.mapbox.geojson.Feature
import com.mapbox.maps.Style
import com.mapbox.maps.extension.style.StyleContract
import com.mapbox.maps.extension.style.sources.Source
import com.mapbox.rctmgl.components.styles.sources.RCTSource.OnPressEvent
import com.mapbox.rctmgl.utils.LatLng
import com.mapbox.rctmgl.utils.Logger
import java.lang.ClassCastException
import java.util.ArrayList
import java.util.HashMap

abstract class RCTSource<T : Source?>(context: Context?) : AbstractMapFeature(context) {
    @JvmField
    protected var mMapView: RCTMGLMapView? = null
    @JvmField
    protected var mMap: MapboxMap? = null
    var iD: String? = null
    @JvmField
    protected var mSource: T? = null
    protected var mHasPressListener = false
    protected var mTouchHitbox: Map<String, Double>? = null
    protected var mLayers: MutableList<AbstractSourceConsumer>
    private var mQueuedLayers: MutableList<AbstractSourceConsumer>?
    val layerIDs: List<String>
        get() {
            val layerIDs: MutableList<String> = ArrayList()
            for (i in mLayers.indices) {
                val layer = mLayers[i]
                val id = layer.iD
                if (id != null) {
                    layerIDs.add(id)
                }
            }
            return layerIDs
        }

    private fun getSourceAs(style: Style, id: String?): T? {
        val result = iD?.let { style.getSource(it) }
        return try {
            result as T?
        } catch (exception: ClassCastException) {
            null
        }
    }

    protected fun addLayerToMap(layer: AbstractSourceConsumer?, childPosition: Int) {
        if (mMapView == null || layer == null) {
            return
        }
        layer.addToMap(mMapView)
        if (!mLayers.contains(layer)) {
            mLayers.add(childPosition, layer)
        }
    }

    open fun hasPressListener(): Boolean {
        return mHasPressListener
    }

    fun setHasPressListener(hasPressListener: Boolean) {
        mHasPressListener = hasPressListener
    }

    fun setHitbox(map: ReadableMap) {
        val hitbox: MutableMap<String, Double> = HashMap()
        hitbox["width"] = map.getDouble("width")
        hitbox["height"] = map.getDouble("height")
        mTouchHitbox = hitbox
    }

    val touchHitbox: Map<String, Double>?
        get() {
            if (!hasPressListener()) {
                return null
            }
            return if (mTouchHitbox == null) {
                MapBuilder.builder<String, Double>()
                        .put("width", DEFAULT_HITBOX_WIDTH)
                        .put("height", DEFAULT_HITBOX_HEIGHT)
                        .build()
            } else mTouchHitbox
        }
    val layerCount: Int
        get() {
            var totalCount = 0
            if (mQueuedLayers != null) {
                totalCount = mQueuedLayers!!.size
            }
            totalCount += mLayers.size
            return totalCount
        }

    override fun addToMap(mapView: RCTMGLMapView) {
        mMapView = mapView
        mMap = mapView.getMapboxMap()
        mMap?.getStyle(object : Style.OnStyleLoaded {
            override fun onStyleLoaded(style: Style) {
                val existingSource = getSourceAs(style, iD)
                if (existingSource != null) {
                    mSource = existingSource
                } else {
                    mSource = makeSource()
                    style.addSource(mSource as StyleContract.StyleSourceExtension)
                }
                if (mQueuedLayers != null && mQueuedLayers!!.size > 0) { // first load
                    for (i in mQueuedLayers!!.indices) {
                        addLayerToMap(mQueuedLayers!![i], i)
                    }
                    mQueuedLayers = null
                } else if (mLayers.size > 0) { // handles the case of switching style url, but keeping layers on map
                    for (i in mLayers.indices) {
                        addLayerToMap(mLayers[i], i)
                    }
                }
            }
        })
    }

    override fun removeFromMap(mapView: RCTMGLMapView) {
        if (mLayers.size > 0) {
            for (i in mLayers.indices) {
                val layer = mLayers[i]
                layer.removeFromMap(mMapView)
            }
        }
        if (mQueuedLayers != null) {
            mQueuedLayers!!.clear()
        }
        if (mMap != null && mSource != null && mMap!!.getStyle() != null) {
            try {
                iD?.let { mMap?.getStyle()?.removeStyleSource(it) }
            } catch (ex: Throwable) {
                Logger.w(LOG_TAG, String.format("RCTSource.removeFromMap: %s - %s", mSource, ex.message), ex)
            }
        }
    }

    fun addLayer(childView: View?, childPosition: Int) {
        if (childView !is AbstractSourceConsumer) {
            return
        }
        val layer = childView
        if (mMap == null) {
            mQueuedLayers?.add(childPosition, layer)
        } else {
            addLayerToMap(layer, childPosition)
        }
    }

    fun removeLayer(childPosition: Int) {
        val layer: AbstractSourceConsumer
        layer = if (mQueuedLayers != null && mQueuedLayers!!.size > 0) {
            mQueuedLayers!![childPosition]
        } else {
            mLayers[childPosition]
        }
        removeLayerFromMap(layer, childPosition)
    }

    fun getLayerAt(childPosition: Int): AbstractSourceConsumer {
        return if (mQueuedLayers != null && mQueuedLayers!!.size > 0) {
            mQueuedLayers!![childPosition]
        } else mLayers[childPosition]
    }

    protected fun removeLayerFromMap(layer: AbstractSourceConsumer?, childPosition: Int) {
        if (mMapView != null && layer != null) {
            layer.removeFromMap(mMapView)
        }
        if (mQueuedLayers != null && mQueuedLayers!!.size > 0) {
            mQueuedLayers?.removeAt(childPosition)
        } else {
            mLayers.removeAt(childPosition)
        }
    }

    abstract fun makeSource(): T
    class OnPressEvent(var features: List<Feature>, var latLng: LatLng, var screenPoint: PointF)

    abstract fun onPress(event: OnPressEvent?)

    companion object {
        const val DEFAULT_ID = "composite"
        const val LOG_TAG = "RCTSource"
        const val DEFAULT_HITBOX_WIDTH = 44.0
        const val DEFAULT_HITBOX_HEIGHT = 44.0
        @JvmStatic
        fun isDefaultSource(sourceID: String): Boolean {
            return DEFAULT_ID == sourceID
        }
    }

    init {
        mLayers = ArrayList()
        mQueuedLayers = ArrayList()
    }
}