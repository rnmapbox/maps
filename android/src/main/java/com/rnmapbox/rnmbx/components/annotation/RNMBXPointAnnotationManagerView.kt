package com.rnmapbox.rnmbx.components.annotation

import android.content.Context
import android.view.View
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXPointAnnotationManagerView(context: Context) : AbstractMapFeature(context) {
    var reactId: String? = null
    var isDefault: Boolean = false

    var slot: String? = null
        set(value) { field = value; applyProps() }
    var iconAllowOverlap: Boolean? = null
        set(value) { field = value; applyProps() }
    var iconIgnorePlacement: Boolean? = null
        set(value) { field = value; applyProps() }
    var iconOptional: Boolean? = null
        set(value) { field = value; applyProps() }
    var textAllowOverlap: Boolean? = null
        set(value) { field = value; applyProps() }
    var textIgnorePlacement: Boolean? = null
        set(value) { field = value; applyProps() }
    var textOptional: Boolean? = null
        set(value) { field = value; applyProps() }

    private val annotations = mutableListOf<RNMBXPointAnnotation>()
    private var coordinator: RNMBXPointAnnotationCoordinator? = null

    fun addAnnotation(childView: View, childPosition: Int) {
        if (childView !is RNMBXPointAnnotation) {
            Logger.w(LOG_TAG, "PointAnnotationManager: only PointAnnotation children are supported")
            return
        }
        annotations.add(childPosition, childView)
        val mapView = mMapView
        if (mapView != null) {
            ensureCoordinator(mapView)
            attachAnnotation(childView, mapView)
        }
    }

    fun removeAnnotationAt(childPosition: Int) {
        val childView = annotations.removeAt(childPosition)
        val mapView = mMapView
        if (mapView != null) {
            coordinator?.remove(childView)
            childView.removeFromMap(mapView, RemovalReason.VIEW_REMOVAL)
        }
        childView.parentCoordinator = null
    }

    override fun getChildAt(childPosition: Int): View {
        return annotations[childPosition]
    }

    override fun getChildCount(): Int {
        return annotations.size
    }

    private fun attachAnnotation(annotation: RNMBXPointAnnotation, mapView: RNMBXMapView) {
        val coordinator = coordinator ?: return
        annotation.parentCoordinator = coordinator
        coordinator.add(annotation)
        annotation.addToMap(mapView)
    }

    private fun ensureCoordinator(mapView: RNMBXMapView) {
        if (coordinator != null) return
        coordinator = if (isDefault) {
            val existing = mapView.defaultPointAnnotationManagerView
            if (existing != null && existing !== this) {
                Logger.w(LOG_TAG, "PointAnnotationManager: multiple default managers declared, ignoring extra default")
            } else {
                mapView.defaultPointAnnotationManagerView = this
            }
            mapView.pointAnnotations
        } else {
            val c = RNMBXPointAnnotationCoordinator(mapView.mapView, reactId)
            mapView.registerPointAnnotationCoordinator(c)
            c
        }
        applyProps()
    }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        ensureCoordinator(mapView)
        for (annotation in annotations) {
            attachAnnotation(annotation, mapView)
        }
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        for (annotation in annotations) {
            coordinator?.remove(annotation)
            annotation.removeFromMap(mapView, reason)
            annotation.parentCoordinator = null
        }
        coordinator?.let { c ->
            if (isDefault) {
                // The default coordinator is shared with bare annotations; leave it in
                // place, just clear the configuration this view applied.
                c.manager.slot = null
                c.manager.iconAllowOverlap = null
                c.manager.iconIgnorePlacement = null
                c.manager.iconOptional = null
                c.manager.textAllowOverlap = null
                c.manager.textIgnorePlacement = null
                c.manager.textOptional = null
            } else {
                mapView.unregisterPointAnnotationCoordinator(c)
                c.destroy()
            }
        }
        if (mapView.defaultPointAnnotationManagerView === this) {
            mapView.defaultPointAnnotationManagerView = null
        }
        coordinator = null
        return super.removeFromMap(mapView, reason)
    }

    private fun applyProps() {
        val manager = coordinator?.manager ?: return
        manager.slot = slot
        manager.iconAllowOverlap = iconAllowOverlap
        manager.iconIgnorePlacement = iconIgnorePlacement
        manager.iconOptional = iconOptional
        manager.textAllowOverlap = textAllowOverlap
        manager.textIgnorePlacement = textIgnorePlacement
        manager.textOptional = textOptional
    }

    companion object {
        const val LOG_TAG = "RNMBXPointAnnotationManagerView"
    }
}
