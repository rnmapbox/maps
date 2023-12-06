package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import androidx.annotation.Size
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.mapbox.geojson.Feature
import com.mapbox.geojson.FeatureCollection
import com.mapbox.maps.SourceQueryOptions
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.sources.generated.VectorSource
import com.mapbox.maps.extension.style.sources.getSource
import com.rnmapbox.rnmbx.events.AndroidCallbackEvent
import com.rnmapbox.rnmbx.events.FeatureClickEvent
import java.util.*

import com.rnmapbox.rnmbx.v11compat.feature.*

class RNMBXVectorSource(context: Context?, private val mManager: RNMBXVectorSourceManager) :
    RNMBXTileSource<VectorSource?>(context) {
    override fun onPress(event: OnPressEvent?) {
        mManager.handleEvent(FeatureClickEvent.makeVectorSourceEvent(this, event))
    }

    override fun hasNoDataSoRefersToExisting(): Boolean {
        return uRL == null && tileUrlTemplates == null;
    }

    override fun makeSource(): VectorSource {
        val id = iD
        if (id == null) {
            throw  RuntimeException("id should be specified for VectorSource");
        }
        if (isDefaultSource(id)) {
            return mMap!!.getStyle()!!.getSource(DEFAULT_ID) as VectorSource
        }
        val configurationUrl = uRL
        return if (configurationUrl != null) {
            VectorSource(
                VectorSource.Builder(id)
                    .url(configurationUrl)
            )
        } else VectorSource(
            VectorSource.Builder(id)
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
        mMap!!.querySourceFeatures(
            iD!!,
            SourceQueryOptions(layerIDs, filter!!)
        ) { queriedFeatures ->
            val payload: WritableMap = WritableNativeMap()
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
            val event = AndroidCallbackEvent(this@RNMBXVectorSource, callbackID, payload)
            mManager.handleEvent(event)
        }
    }
}