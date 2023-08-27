package com.mapbox.rctmgl.components.styles.terrain

import android.content.Context
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.extension.style.terrain.generated.Terrain
import com.mapbox.maps.extension.style.terrain.generated.removeTerrain
import com.mapbox.rctmgl.components.RemovalReason
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.styles.RCTMGLStyle
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory
import com.mapbox.rctmgl.components.styles.sources.AbstractSourceConsumer
import com.mapbox.rctmgl.utils.Logger

class RCTMGLTerrain(context: Context?) : AbstractSourceConsumer(context) {
    override var iD: String? = null
    protected var mSourceID: String? = null
    protected var mTerrain: Terrain? = null

    // beginregion RCTLayer
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
    // endregion RCTLayer

    fun setSourceID(sourceID: String?) {
        mSourceID = sourceID
    }

    override fun addToMap(mapView: RCTMGLMapView) {
        super.addToMap(mapView)
        mMap = mapView.getMapboxMap()
        val terrain = makeTerrain()
        mTerrain = terrain
        addStyles()
        mapView.savedStyle?.let { terrain.bindTo(it) }
    }

    override fun removeFromMap(mapView: RCTMGLMapView, reason: RemovalReason): Boolean {
        mapView.savedStyle?.let { it.removeTerrain() }
        mMap = null
        return super.removeFromMap(mapView, reason)
    }

    fun makeTerrain(): Terrain {
        return Terrain(mSourceID!!)
    }

    fun addStyles() {
        RCTMGLStyleFactory.setTerrainLayerStyle(
            mTerrain, RCTMGLStyle(
                context, mReactStyle!!,
                mMap!!
            )
        )
    }
}