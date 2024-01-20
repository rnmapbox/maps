package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import androidx.annotation.Size
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.mapbox.geojson.Feature
import com.mapbox.geojson.FeatureCollection
import com.mapbox.maps.SourceQueryOptions
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.sources.generated.RasterDemSource
import com.mapbox.maps.extension.style.sources.getSource
import com.rnmapbox.rnmbx.events.AndroidCallbackEvent
import com.rnmapbox.rnmbx.events.FeatureClickEvent
import com.rnmapbox.rnmbx.utils.Logger
import java.util.*

import com.rnmapbox.rnmbx.v11compat.feature.*

// import com.rnmapbox.rnmbx.R;
// import com.rnmapbox.rnmbx.utils.DownloadMapImageTask;
class RNMBXRasterDemSource(context: Context?, private val mManager: RNMBXRasterDemSourceManager) :
    RNMBXTileSource<RasterDemSource?>(context) {

    private var tileSize: Long? = null

    override fun onPress(event: OnPressEvent?) {
        mManager.handleEvent(FeatureClickEvent.makeVectorSourceEvent(this, event))
    }

    override fun makeSource(): RasterDemSource? {
        val id = iD
        if (id == null) {
            Logger.w("RNMBXRasterDemSource", "id is required")
            return null
        }
        if (isDefaultSource(id)) {
            return mMap!!.getStyle()!!.getSource(DEFAULT_ID) as RasterDemSource
        }
        val configurationUrl = uRL

        val builder = if (configurationUrl != null) {
            RasterDemSource.Builder(id)
                .url(configurationUrl)
        } else {
            RasterDemSource.Builder(id)
                .tileSet(buildTileset())
        }

        tileSize?.let { builder.tileSize(it) }

        return RasterDemSource(builder)
    }

    fun querySourceFeatures(
        callbackID: String?,
        @Size(min = 1) layerIDs: List<String?>?,
        filter: Expression?
    ) {
        if (mSource == null) {
            val payload: WritableMap = WritableNativeMap()
            payload.putString("error", "source is not yet loaded")
            val event = AndroidCallbackEvent(this, callbackID, payload)
            mManager.handleEvent(event)
            return
        }
        val payload: WritableMap = WritableNativeMap()
        mMap!!.querySourceFeatures(
            iD!!,
            SourceQueryOptions(layerIDs, filter!!)
        ) { queriedFeatures ->
            if (queriedFeatures.isError) {
                //V10todo
                payload.putString("error", queriedFeatures.error)
            } else {
                val features: MutableList<Feature> = LinkedList()
                for (feature in queriedFeatures.value!!) {
                    features.add(feature.feature)
                }
                payload.putString("data", FeatureCollection.fromFeatures(features).toJson())
            }
        }
        val event = AndroidCallbackEvent(this, callbackID, payload)
        mManager.handleEvent(event)
    }

    override fun hasNoDataSoRefersToExisting(): Boolean {
        return uRL == null && tileUrlTemplates.isEmpty()
    }

    fun setTileSize(tileSize: Int) {
        this.tileSize = tileSize.toLong()
    }
}