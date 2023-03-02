package com.mapbox.rctmgl.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.layers.Layer
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.maps.Style
import com.mapbox.maps.MapView
import com.mapbox.rctmgl.components.styles.sources.AbstractSourceConsumer
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.MapboxMap
import com.facebook.react.bridge.ReadableArray
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView.FoundLayerCallback
import com.facebook.common.logging.FLog
import com.mapbox.maps.extension.style.expressions.dsl.generated.all
import com.mapbox.maps.extension.style.expressions.dsl.generated.literal
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.*
import com.mapbox.maps.extension.style.layers.properties.generated.Visibility
import com.mapbox.rctmgl.components.styles.layers.RCTLayer
import com.mapbox.rctmgl.modules.RCTMGLLogging
import com.mapbox.rctmgl.utils.ExpressionParser
import java.lang.ClassCastException
import com.mapbox.rctmgl.utils.Logger

abstract class RCTLayer<T : Layer?>(protected var mContext: Context) : AbstractSourceConsumer(
    mContext
) {
    override var iD: String? = null
    @JvmField
    protected var mSourceID: String? = null
    protected var mAboveLayerID: String? = null
    protected var mBelowLayerID: String? = null
    protected var mLayerIndex: Int? = null
    protected var mVisible = false
    protected var mMinZoomLevel: Double? = null
    protected var mMaxZoomLevel: Double? = null
    @JvmField
    protected var mReactStyle: ReadableMap? = null
    protected var mFilter: Expression? = null
    @JvmField
    protected var mMap: MapboxMap? = null
    @JvmField
    protected var mLayer: T? = null
    protected var mHadFilter = false

    fun setSourceID(sourceID: String?) {
        mSourceID = sourceID
    }

    fun setAboveLayerID(aboveLayerID: String?) {
        if (mAboveLayerID != null && mAboveLayerID == aboveLayerID) {
            return
        }
        mAboveLayerID = aboveLayerID
        if (mLayer != null) {
            removeFromMap(mMapView!!)
            addAbove(mAboveLayerID)
        }
    }

    fun setBelowLayerID(belowLayerID: String?) {
        if (mBelowLayerID != null && mBelowLayerID == belowLayerID) {
            return
        }
        mBelowLayerID = belowLayerID
        if (mLayer != null) {
            removeFromMap(mMapView!!)
            addBelow(mBelowLayerID)
        }
    }

    fun setLayerIndex(layerIndex: Int) {
        if (mLayerIndex != null && mLayerIndex == layerIndex) {
            return
        }
        mLayerIndex = layerIndex
        if (mLayer != null) {
            removeFromMap(mMapView!!)
            addAtIndex(mLayerIndex!!)
        }
    }

    fun setVisible(visible: Boolean) {
        mVisible = visible
        if (mLayer != null) {
            mLayer!!.visibility(if (mVisible) Visibility.VISIBLE else Visibility.NONE)
        }
    }

    fun setMinZoomLevel(minZoomLevel: Double) {
        mMinZoomLevel = minZoomLevel
        if (mLayer != null) {
            mLayer!!.minZoom(minZoomLevel.toFloat().toDouble())
        }
    }

    fun setMaxZoomLevel(maxZoomLevel: Double) {
        mMaxZoomLevel = maxZoomLevel
        if (mLayer != null) {
            mLayer!!.maxZoom(maxZoomLevel.toFloat().toDouble())
        }
    }

    fun setReactStyle(reactStyle: ReadableMap?) {
        mReactStyle = reactStyle
        if (mLayer != null) {
            addStyles()
        }
    }

    fun setFilter(readableFilterArray: ReadableArray?) {
        val filterExpression = ExpressionParser.from(readableFilterArray)
        mFilter = filterExpression
        if (mLayer != null) {
            if (mFilter != null) {
                mHadFilter = true
                updateFilter(mFilter)
            } else if (mHadFilter) {
                updateFilter(/* literal(true)*/all {} )
            }
        }
    }

    fun add() {
        if (!hasInitialized()) {
            return
        }
        if (style == null) return

        /* V10TODO
        String userBackgroundID = LocationComponentConstants.BACKGROUND_LAYER;
        Layer userLocationBackgroundLayer = getStyle().getLayer(userBackgroundID);

        // place below user location layer
        if (userLocationBackgroundLayer != null) {
            getStyle().addLayerBelow(mLayer, userBackgroundID);
            mMapView.layerAdded(mLayer);
            return;
        } */

        Logger.logged("RCTLayer.add") {
            style!!.addLayer(mLayer!!);
            mMapView!!.layerAdded(mLayer!!)
        }
    }

    fun addAbove(aboveLayerID: String?) {
        mMapView!!.waitForLayer(aboveLayerID, object : FoundLayerCallback {
            override fun found(layer: Layer?) {
                if (!hasInitialized()) {
                    return
                }
                if (style == null) return
                style!!.addLayerAbove(mLayer!!, aboveLayerID)
                mMapView!!.layerAdded(mLayer!!)
            }
        })
    }

    fun addBelow(belowLayerID: String?) {
        mMapView!!.waitForLayer(belowLayerID, object : FoundLayerCallback {
            override fun found(layer: Layer?) {
                if (!hasInitialized()) {
                    return
                }
                if (style == null) return
                style!!.addLayerBelow(mLayer!!, belowLayerID)
                mMapView!!.layerAdded(mLayer!!)
            }
        })
    }

    fun addAtIndex(index: Int) {
        var index = index
        if (!hasInitialized()) {
            return
        }
        if (style == null) return
        val layerSize = style!!.styleLayers.size
        if (index >= layerSize) {
            FLog.e(
                LOG_TAG,
                "Layer index is greater than number of layers on map. Layer inserted at end of layer stack."
            )
            index = layerSize - 1
        }
        style!!.addLayerAt(mLayer!!, index)
        mMapView!!.layerAdded(mLayer!!)
    }

    protected fun insertLayer() {
        if (style == null) return
        if (style!!.getLayer(iD!!) != null) {
            return  // prevent adding a layer twice
        }
        if (mAboveLayerID != null) {
            addAbove(mAboveLayerID)
        } else if (mBelowLayerID != null) {
            addBelow(mBelowLayerID)
        } else if (mLayerIndex != null) {
            addAtIndex(mLayerIndex!!)
        } else {
            add()
        }
        setZoomBounds()
    }

    protected fun setZoomBounds() {
        if (mMaxZoomLevel != null) {
            mLayer!!.maxZoom(mMaxZoomLevel!!.toFloat().toDouble())
        }
        if (mMinZoomLevel != null) {
            mLayer!!.minZoom(mMinZoomLevel!!.toFloat().toDouble())
        }
    }

    protected open fun updateFilter(expression: Expression?) {
        // override if you want to update the filter
    }

    private fun getLayerAs(style: Style?, id: String?): T? {
        val result = style!!.getLayer(iD!!)
        return try {
            result as T?
        } catch (exception: ClassCastException) {
            null
        }
    }

    override fun addToMap(mapView: RCTMGLMapView) {
        super.addToMap(mapView)
        mMap = mapView.getMapboxMap()
        if (style == null) return
        val existingLayer = getLayerAs(style, iD)
        if (existingLayer != null) {
            mLayer = existingLayer
        } else {
            mLayer = makeLayer()
            insertLayer()
        }
        addStyles()
        if (mFilter != null) {
            mHadFilter = true
            updateFilter(mFilter)
        }
    }

    override fun removeFromMap(mapView: RCTMGLMapView) {
        if (style != null) {
            style!!.removeStyleLayer(mLayer!!.layerId)
        }
        super.removeFromMap(mapView)
    }

    private val style: Style?
        private get() =
            if (mMap == null) {
                null
            } else mMapView?.savedStyle

    abstract fun makeLayer(): T
    abstract fun addStyles()
    private fun hasInitialized(): Boolean {
        return mMap != null && mLayer != null
    }

    companion object {
        const val LOG_TAG = "RCTLayer"
    }
}
