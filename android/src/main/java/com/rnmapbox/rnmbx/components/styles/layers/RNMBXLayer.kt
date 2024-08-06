package com.rnmapbox.rnmbx.components.styles.layers

import android.content.Context
import com.mapbox.maps.extension.style.layers.Layer
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.mapbox.maps.Style
import com.rnmapbox.rnmbx.components.styles.sources.AbstractSourceConsumer
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.MapboxMap
import com.facebook.react.bridge.ReadableArray
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView.FoundLayerCallback
import com.facebook.common.logging.FLog
import com.mapbox.maps.extension.style.expressions.dsl.generated.all
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.*
import com.mapbox.maps.extension.style.layers.properties.generated.Visibility
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.utils.ExpressionParser
import java.lang.ClassCastException
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.v11compat.layer.*

abstract class RNMBXLayer<T : Layer?>(protected var mContext: Context) : AbstractSourceConsumer(
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
    protected var mLayer: T? = null
    protected var mHadFilter = false

    protected var mExisting : Boolean? = null

    fun setSourceID(sourceID: String?) {
        mSourceID = sourceID
    }

    fun checkID(): String? {
        if (iD == null) {
            Logger.w(LOG_TAG, "iD is null in layer")
        }
        return iD;
    }

    fun setAboveLayerID(aboveLayerID: String?) {
        if (mAboveLayerID != null && mAboveLayerID == aboveLayerID) {
            return
        }
        mAboveLayerID = aboveLayerID
        if (aboveLayerID == null) {
            return
        }
        mMapView?.let {mapView ->
            removeFromMap(mapView, RemovalReason.REORDER)
            addAbove(mapView, aboveLayerID)
        }
    }

    fun setBelowLayerID(belowLayerID: String?) {
        if (mBelowLayerID != null && mBelowLayerID == belowLayerID) {
            return
        }
        mBelowLayerID = belowLayerID
        if (belowLayerID == null) {
            return
        }
        mMapView?.let { mapView ->
            removeFromMap(mapView,RemovalReason.REORDER)
            addBelow(mapView, belowLayerID)
        }
    }

    fun setLayerIndex(layerIndex: Int) {
        if (mLayerIndex != null && mLayerIndex == layerIndex) {
            return
        }
        mLayerIndex = layerIndex
        if (mLayer != null) {
            removeFromMap(mMapView!!,RemovalReason.REORDER)
            addAtIndex(layerIndex)
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
        mLayer?.let {
           it.maxZoom(maxZoomLevel.toFloat().toDouble())
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

    var mSlot: String? = null

    fun setSlot(slot: String?) {
        mSlot = slot
        applySlot()
    }

    fun setExisting(existing: Boolean) {
        mExisting = existing
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

        Logger.logged("RNMBXLayer.add") {
            style!!.addLayer(mLayer!!)
            mMapView!!.layerAdded(mLayer!!)
        }
    }

    fun addAbove(mapView: RNMBXMapView, aboveLayerID: String) {
        mapView.waitForLayer(aboveLayerID, object : FoundLayerCallback {
            override fun found(aboveLayer: Layer?) {
                if (!hasInitialized()) {
                    return
                }
                mapView.savedStyle?.let { style ->
                    mLayer?.let {layer ->
                        style.addLayerAbove(layer, aboveLayerID)
                        mapView.layerAdded(layer)
                        mMapView = mapView
                    }
                }
            }
        })
    }

    fun addBelow(mapView: RNMBXMapView, belowLayerID: String) {
        mapView.waitForLayer(belowLayerID, object : FoundLayerCallback {
            override fun found(belowLayer: Layer?) {
                if (!hasInitialized()) {
                    return
                }
                mapView.savedStyle?.let { style ->
                    mLayer?.let { layer ->
                        style.addLayerBelow(layer, belowLayerID)
                        mapView.layerAdded(layer)
                        mMapView = mapView
                    }
                }
            }
        })
    }

    fun addAtIndex(index: Int) {
        var index = index
        if (!hasInitialized()) {
            return
        }
        val style = this.style ?: return
        val layerSize = style!!.styleLayers.size
        if (index >= layerSize) {
            FLog.e(
                LOG_TAG,
                "Layer index is greater than number of layers on map. Layer inserted at end of layer stack."
            )
            index = layerSize - 1
        }
        val layer = mLayer ?: return
        val mapView = mMapView ?: return
        style.addLayerAt(layer, index)
        mapView.layerAdded(layer)
    }

    protected fun insertLayer() {
        val style = this.style ?: return
        val id = checkID() ?: return
        if (style.styleLayerExists(id)) {
            return  // prevent adding a layer twice
        }
        mMapView?.let { mapView ->
            mLayer?.let { layer ->
                mAboveLayerID?.also {
                    addAbove(mapView, it)
                } ?: run { mBelowLayerID?.also {
                    addBelow(mapView, it)
                } ?: run { mLayerIndex?.also {
                    addAtIndex(it)
                } ?: run {
                    add ()
                } } }
            }
            applyZoomBounds()
            applySlot()
        }
    }

    protected fun applyZoomBounds() {
        mLayer?.let {layer ->
            mMaxZoomLevel?.let {
                layer.maxZoom(it.toDouble())
            }
            mMinZoomLevel?.let {
                layer.minZoom(it.toDouble())
            }
        }
    }

    protected fun applySlot() {
        mLayer?.let { layer ->
            mSlot?.let {
                layer.slot(it)
            }
        }
    }

    protected open fun updateFilter(expression: Expression?) {
        // override if you want to update the filter
    }

    private fun getLayerAs(style: Style, id: String?): T? {
        val result = style.getLayer(iD!!)
        return try {
            result as T?
        } catch (exception: ClassCastException) {
            null
        }
    }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        mMap = mapView.getMapboxMap()
        val style = style ?: return
        val id = checkID() ?: return

        val exists = style.styleLayerExists(id)
        var existingLayer: T? = null;
        if (exists) {
            if (mExisting == null) {
                Logger.e(LOG_TAG, "Layer $id seems to refer to an existing layer but existing flag is not specified, this is deprecated")
            }
            existingLayer = getLayerAs(style, id)
        }
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

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        style?.let {
            val layer = mLayer
            if (layer != null) {
                it.removeStyleLayer(layer.layerId)
                if (reason != RemovalReason.REORDER) {
                    mLayer = null // see https://github.com/rnmapbox/maps/pull/3392
                }
            } else {
                Logger.e("RNMBXLayer","mLayer is null on removal layer from map")
            }
        }
        return super.removeFromMap(mapView, reason)
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
        const val LOG_TAG = "RNMBXLayer"
    }
}
