package com.rnmapbox.rnmbx.components.annotation

import com.mapbox.maps.MapView
import com.mapbox.maps.plugin.annotation.Annotation
import com.mapbox.maps.plugin.annotation.AnnotationConfig
import com.mapbox.maps.plugin.annotation.annotations
import com.mapbox.maps.plugin.annotation.generated.OnPointAnnotationClickListener
import com.mapbox.maps.plugin.annotation.generated.OnPointAnnotationDragListener
import com.mapbox.maps.plugin.annotation.generated.PointAnnotation
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationManager
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationOptions
import com.mapbox.maps.plugin.annotation.generated.createPointAnnotationManager
import com.rnmapbox.rnmbx.components.annotation.RNMBXPointAnnotation
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXPointAnnotationCoordinator(val mapView: MapView) {
    val manager: PointAnnotationManager;
    var annotationClicked = false
    var annotationDragged = false

    var selected: RNMBXPointAnnotation? = null

    val annotations: MutableMap<String, RNMBXPointAnnotation> = hashMapOf()
    val callouts: MutableMap<String, RNMBXPointAnnotation> = hashMapOf()

    init {
        manager = mapView.annotations.createPointAnnotationManager(AnnotationConfig(layerId = "RNMBX-mapview-annotations"))
        manager.addClickListener(OnPointAnnotationClickListener { pointAnnotation ->
            onAnnotationClick(pointAnnotation)
            false
        })
        manager.addDragListener(object : OnPointAnnotationDragListener {
            override fun onAnnotationDragStarted(_annotation: Annotation<*>) {
                annotationDragged = true;
                var reactAnnotation: RNMBXPointAnnotation? = null
                for (key in annotations.keys) {
                    val annotation = annotations[key]
                    val curMarkerID = annotation?.mapboxID
                    if (_annotation.id == curMarkerID) {
                        reactAnnotation = annotation
                    }
                }
                reactAnnotation?.let { it.onDragStart() }
            }

            override fun onAnnotationDrag(_annotation: Annotation<*>) {
                var reactAnnotation: RNMBXPointAnnotation? = null
                for (key in annotations.keys) {
                    val annotation = annotations[key]
                    val curMarkerID = annotation?.mapboxID
                    if (_annotation.id == curMarkerID) {
                        reactAnnotation = annotation
                    }
                }
                reactAnnotation?.let { it.onDrag() }
            }

            override fun onAnnotationDragFinished(_annotation: Annotation<*>) {
                annotationDragged = false;
                var reactAnnotation: RNMBXPointAnnotation? = null
                for (key in annotations.keys) {
                    val annotation = annotations[key]
                    val curMarkerID = annotation?.mapboxID
                    if (_annotation.id == curMarkerID) {
                        reactAnnotation = annotation
                    }
                }
                reactAnnotation?.let { it.onDragEnd() }
            }
        })
    }

    fun getAndClearAnnotationClicked(): Boolean {
        if (annotationClicked) {
            annotationClicked = false
            return true
        }
        return false
    }

    fun getAndClearAnnotationDragged(): Boolean {
        if (annotationDragged) {
            annotationDragged = false
            return true
        }
        return false
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

    companion object {
        const val LOG_TAG = "RNMBXPointAnnotationCoordinator";
    }
}
