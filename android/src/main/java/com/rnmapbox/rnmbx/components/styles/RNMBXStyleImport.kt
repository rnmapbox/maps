package com.rnmapbox.rnmbx.components.styles

import android.content.Context
import com.mapbox.bindgen.Value
import com.mapbox.common.Cancelable
import com.mapbox.maps.StyleDataLoadedType
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView

class RNMBXStyleImport(context: Context) : AbstractMapFeature(context) {
    var id: String? = null;

    var config: HashMap<String, Value> = hashMapOf()
        set(value: HashMap<String, Value>) {
            field = value
            if (mMapView != null) { updateConfig() }
        }

    /** Config is applied once the style root is parsed (StyleDataLoaded STYLE), so the first frame already uses it. */
    override var requiresStyleLoad = false

    private var styleDataLoadedSubscription: Cancelable? = null

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        styleDataLoadedSubscription = mapView.getMapboxMap().subscribeStyleDataLoaded {
            if (it.type == StyleDataLoadedType.STYLE) { updateConfig() }
        }
        updateConfig()
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        if (reason == RemovalReason.STYLE_CHANGE) return false
        styleDataLoadedSubscription?.cancel()
        styleDataLoadedSubscription = null
        return super.removeFromMap(mapView, reason)
    }

    fun updateConfig() {
        val map = mMapView?.getMapboxMap() ?: return
        val id = id ?: return
        if (config.isNotEmpty() && map.getStyleImports().any { it.id == id }) {
            map.setStyleImportConfigProperties(id, config)
        }
    }
}
