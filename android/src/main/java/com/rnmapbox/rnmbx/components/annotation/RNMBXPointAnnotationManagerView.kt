package com.rnmapbox.rnmbx.components.annotation

import android.content.Context
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView

class RNMBXPointAnnotationManagerView(context: Context) : AbstractMapFeature(context) {
    var slot: String? = null
        set(value) {
            field = value
            applySlot()
        }

    private fun applySlot() {
        withMapView { mapView ->
            slot?.let { mapView.pointAnnotations?.manager?.slot = it }
                ?: run { mapView.pointAnnotations?.manager?.slot = null }
        }
    }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        applySlot()
    }
}
