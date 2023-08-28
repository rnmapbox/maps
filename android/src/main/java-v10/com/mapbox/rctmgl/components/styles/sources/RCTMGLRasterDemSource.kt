package com.mapbox.rctmgl.components.styles.sources

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
import com.mapbox.rctmgl.events.AndroidCallbackEvent
import com.mapbox.rctmgl.events.FeatureClickEvent
import com.mapbox.rctmgl.utils.Logger
import java.util.*

// import com.mapbox.rctmgl.R;
// import com.mapbox.rctmgl.utils.DownloadMapImageTask;
class RCTMGLRasterDemSource(context: Context?, private val mManager: RCTMGLRasterDemSourceManager) :
    RCTMGLTileSource<RasterDemSource?>(context) {
    override fun onPress(event: OnPressEvent?) {
        mManager.handleEvent(FeatureClickEvent.makeVectorSourceEvent(this, event))
    }

    override fun makeSource(): RasterDemSource? {
        val id = iD
        if (id == null) {
            Logger.w("RCTMGLRasterDemSource", "id is required")
            return null
        }
        if (isDefaultSource(id)) {
            return mMap!!.getStyle()!!.getSource(DEFAULT_ID) as RasterDemSource
        }
        val configurationUrl = uRL
        return if (configurationUrl != null) {
            RasterDemSource(
                RasterDemSource.Builder(id)
                    .url(configurationUrl)
            )
        } else RasterDemSource(
            RasterDemSource.Builder(id)
                .tileSet(buildTileset())
        )
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
}