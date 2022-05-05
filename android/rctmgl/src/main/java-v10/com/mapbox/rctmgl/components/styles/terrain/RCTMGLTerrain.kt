package com.mapbox.rctmgl.components.styles.terrain

import android.content.Context
import com.facebook.react.bridge.Dynamic
import com.mapbox.rctmgl.components.styles.sources.AbstractSourceConsumer
import com.mapbox.maps.extension.style.terrain.generated.Terrain
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.facebook.react.bridge.ReadableType
import com.mapbox.rctmgl.utils.ExpressionParser
import com.mapbox.rctmgl.utils.Logger

class RCTMGLTerrain(context: Context?) : AbstractSourceConsumer(context) {
    override var iD: String? = null
    protected var mSourceID: String? = null
    protected var mExaggeration: Dynamic? = null
    protected var mTerrain: Terrain? = null

    fun setSourceID(sourceID: String?) {
        mSourceID = sourceID
    }

    override fun addToMap(mapView: RCTMGLMapView) {
        val terrain = makeTerrain()
        addStyles(terrain)
        mTerrain = terrain
        mapView.savedStyle?.let { mTerrain!!.bindTo(it) }
    }

    override fun removeFromMap(mapView: RCTMGLMapView) {
        val emptyTerrain = Terrain("no-such-source-empty")
        mapView.savedStyle?.let { emptyTerrain.bindTo(it) }
    }

    fun makeTerrain(): Terrain {
        return Terrain(mSourceID!!)
    }

    fun setExaggeration(exaggeration: Dynamic?) {
        mExaggeration = exaggeration
    }

    fun addStyles(terrain: Terrain) {
        when (mExaggeration!!.type) {
            ReadableType.Number -> terrain.exaggeration(mExaggeration!!.asDouble())
            ReadableType.Array -> terrain.exaggeration(
                    ExpressionParser.from(mExaggeration!!.asArray())!!
            )
            else -> Logger.e(
                    "RCTMGLTerrain",
                    "Unexpected type passed to exaggeration:$mExaggeration"
            )
        }
    }

    fun setSourceLayerID(sourceLayerID: String?) {
        Logger.e("RCTMGLSkyLayer", "Source layer should not be set for source layer id")
    }
}