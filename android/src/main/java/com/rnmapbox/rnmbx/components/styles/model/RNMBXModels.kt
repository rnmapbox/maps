package com.rnmapbox.rnmbx.components.styles.model

import android.content.Context
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReadableMap
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import java.net.URI

class RNMBXModels(context: Context?) : AbstractMapFeature(context) {
    private var models: Map<String, String>? = null;

    fun setModels(value: Map<String,String>) {
        this.models = value;
        applyModels()
    }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        applyModels()
    }

    private fun applyModels(){
        mMapView?.mapView?.getMapboxMap()?.getStyle()?.let { style ->
            models?.forEach { (modelId,modelUri) ->
                val uri = URI.create(modelUri)
                val modelUriWithoutQuery = URI(uri.scheme, uri.userInfo, uri.host, uri.port, uri.path, null, uri.fragment).toString()

                style.addStyleModel(modelId, modelUriWithoutQuery)
            }
        }
    }
}