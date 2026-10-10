package com.rnmapbox.rnmbx.components.annotation

import com.mapbox.maps.MapView
import com.mapbox.maps.ScreenCoordinate
import com.mapbox.maps.plugin.annotation.AnnotationConfig
import com.mapbox.maps.plugin.annotation.annotations
import com.mapbox.maps.plugin.annotation.generated.OnPointAnnotationClickListener
import com.mapbox.maps.plugin.annotation.generated.PointAnnotation
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationManager
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationOptions
import com.mapbox.maps.plugin.annotation.generated.createPointAnnotationManager
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXPointAnnotationCoordinator(val mapView: MapView, layerId: String? = "RNMBX-mapview-annotations") {
    val manager: PointAnnotationManager;
    var annotationClicked = false

    var selected: RNMBXPointAnnotation? = null

    private var draggedAnnotation: RNMBXPointAnnotation? = null

    val annotations: MutableMap<String, RNMBXPointAnnotation> = hashMapOf()
    val callouts: MutableMap<String, RNMBXPointAnnotation> = hashMapOf()

    val isDragging: Boolean
        get() = draggedAnnotation != null

    init {
        manager = if (layerId != null) {
            mapView.annotations.createPointAnnotationManager(AnnotationConfig(layerId = layerId))
        } else {
            mapView.annotations.createPointAnnotationManager()
        }
        manager.addClickListener(OnPointAnnotationClickListener { pointAnnotation ->
            onAnnotationClick(pointAnnotation)
            false
        })
    }

    fun getAndClearAnnotationClicked(): Boolean {
        if (annotationClicked) {
            annotationClicked = false
            return true
        }
        return false
    }

    /**
     * Starts a custom long-press drag if a draggable RN PointAnnotation is under [screenCoordinate].
     * Mapbox SDK drag is disabled; this mirrors iOS UILongPress-driven dragging.
     */
    fun handleLongPress(screenCoordinate: ScreenCoordinate): Boolean {
        if (draggedAnnotation != null) {
            return true
        }
        val pointAnnotation = manager.queryMapForFeatures(screenCoordinate) ?: return false
        val reactAnnotation = lookupForClick(pointAnnotation) ?: return false
        if (!reactAnnotation.isDraggable) {
            return false
        }
        draggedAnnotation = reactAnnotation
        reactAnnotation.onDragStart()
        return true
    }

    fun handleDragMove(screenCoordinate: ScreenCoordinate): Boolean {
        val reactAnnotation = draggedAnnotation ?: return false
        val mapboxMap = mapView.mapboxMap
        val point = mapboxMap.coordinateForPixel(screenCoordinate)
        reactAnnotation.setCoordinate(point)
        reactAnnotation.onDrag()
        return true
    }

    fun handleDragEnd(): Boolean {
        val reactAnnotation = draggedAnnotation ?: return false
        draggedAnnotation = null
        reactAnnotation.onDragEnd()
        return true
    }

    fun lookupForClick(point: PointAnnotation): RNMBXPointAnnotation? {
        for (annotation in annotations.values) {
            if (point.id == annotation.mapboxID) {
                return annotation;
            }
            if (point.id == annotation.calloutMapboxID) {
                return null;
            }
        }
        Logger.e(LOG_TAG, "Failed to find RNMBXPointAnnotation for ${point.id}")
        return null;
    }

    fun onAnnotationClick(pointAnnotation: RNMBXPointAnnotation) {
        var oldSelected: RNMBXPointAnnotation? = selected
        var newSelected: RNMBXPointAnnotation? = pointAnnotation

        annotationClicked = true

        if (newSelected == oldSelected) {
            newSelected = null
        }

        oldSelected?.let { deselectAnnotation(it) }
        newSelected?.let { selectAnnotation(it) }

    }

    fun onAnnotationClick(point: PointAnnotation) {
        lookupForClick(point)?.let {
            onAnnotationClick(it)
        }
    }

    fun deselectSelectedAnnotation(): Boolean {
        selected?.let {
            deselectAnnotation(it)
            return true
        }
        return false
    }

    fun selectAnnotation(annotation: RNMBXPointAnnotation) {
        selected = annotation
        annotation.doSelect(true)
    }

    fun deselectAnnotation(annotation: RNMBXPointAnnotation) {
        selected = null
        annotation.doDeselect()
    }

    fun remove(annotation: RNMBXPointAnnotation) {
        if (annotation == selected) {
            selected = null
        }
        if (annotation == draggedAnnotation) {
            draggedAnnotation = null
        }
        annotations.remove(annotation.iD)
    }

    fun delete(annotation: PointAnnotation) {
        manager.delete(annotation)
    }

    fun update(annotation: PointAnnotation) {
        manager.update(annotation)
    }

    fun create(options: PointAnnotationOptions): PointAnnotation {
        return manager.create(options)
    }

    fun add(annotation: RNMBXPointAnnotation) {
        annotations[annotation.iD!!] = annotation
    }

    fun destroy() {
        draggedAnnotation = null
        mapView.annotations.removeAnnotationManager(manager)
    }

    companion object {
        const val LOG_TAG = "RNMBXPointAnnotationCoordinator";
    }
}
