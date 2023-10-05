package com.rnmapbox.rnmbx.components.styles.terrain

import android.content.Context
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.extension.style.terrain.generated.Terrain
import com.mapbox.maps.extension.style.terrain.generated.removeTerrain
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.components.styles.RNMBXStyle
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.rnmapbox.rnmbx.components.styles.sources.AbstractSourceConsumer
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXTerrain(context: Context?) : AbstractSourceConsumer(context) {
    override var iD: String? = null
    protected var mSourceID: String? = null
    protected var mTerrain: Terrain? = null

    // beginregion RNMBXLayer
    @JvmField
    protected var mMap: MapboxMap? = null

    @JvmField
    protected var mReactStyle: ReadableMap? = null

    fun setReactStyle(reactStyle: ReadableMap?) {
        mReactStyle = reactStyle
        if (mTerrain != null) {
            addStyles()
        }
    }
    // endregion RNMBXLayer

    fun setSourceID(sourceID: String?) {
        mSourceID = sourceID
    }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        mMap = mapView.getMapboxMap()
        val terrain = makeTerrain()
        mTerrain = terrain
        addStyles()
        mapView.savedStyle?.let { terrain.bindTo(it) }
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        mapView.savedStyle?.let { it.removeTerrain() }
        mMap = null
        return super.removeFromMap(mapView, reason)
    }

    fun makeTerrain(): Terrain {
        return Terrain(mSourceID!!)
    }

    fun addStyles() {
        mTerrain?.also {
            RNMBXStyleFactory.setTerrainLayerStyle(
                it,
                RNMBXStyle(context, mReactStyle, mMap!!)
            )
        } ?: run {
            Logger.e("RNMBXTerrainLayer", "mLayer is null")
        }
    }
}