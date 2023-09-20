package com.rnmapbox.rnmbx.components.styles

import android.content.Context
import android.view.ViewGroup
import com.mapbox.bindgen.Value
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView

import com.rnmapbox.rnmbx.v11compat.style.*

class RNMBXStyleImport(context: Context) : AbstractMapFeature(context) {
    var id: String? = null;

    var config: HashMap<String, Value> = hashMapOf()
        set(value: HashMap<String, Value>) {
            field = value
            if (mMapView != null) { updateConfig() }
        }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        updateConfig()
    }

    fun updateConfig() {
        withMapView {mapView ->
            id?.let { id ->
                val config = this.config
                if (config.isNotEmpty()) {
                    mapView.mapView.getMapboxMap().getStyle()
                        ?.setStyleImportConfigProperties(id, config)
                }
            }
        }

    }
}
