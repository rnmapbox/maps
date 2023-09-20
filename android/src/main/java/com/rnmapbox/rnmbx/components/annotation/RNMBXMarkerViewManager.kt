package com.rnmapbox.rnmbx.components.annotation

import android.view.View
import android.widget.FrameLayout
import com.rnmapbox.rnmbx.utils.GeoJSONUtils.toPointGeometry
import com.facebook.react.bridge.ReactApplicationContext
import com.rnmapbox.rnmbx.components.AbstractEventEmitter
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.mapbox.maps.ScreenCoordinate
import com.mapbox.maps.viewannotation.OnViewAnnotationUpdatedListener
import com.mapbox.maps.viewannotation.ViewAnnotationManager
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView

class RNMBXMarkerViewManager(reactApplicationContext: ReactApplicationContext) :
    AbstractEventEmitter<RNMBXMarkerView?>(reactApplicationContext) {
    override fun getName(): String {
        return REACT_CLASS
    }

    @ReactProp(name = "coordinate")
    fun setCoordinate(markerView: RNMBXMarkerView, geoJSONStr: String?) {
        markerView.setCoordinate(toPointGeometry(geoJSONStr))
    }

    @ReactProp(name = "anchor")
    fun setAnchor(markerView: RNMBXMarkerView, map: ReadableMap) {
        markerView.setAnchor(map.getDouble("x").toFloat(), map.getDouble("y").toFloat())
    }

    @ReactProp(name = "allowOverlap")
    fun setAllowOverlap(markerView: RNMBXMarkerView, allowOverlap: Boolean) {
        markerView.setAllowOverlap(allowOverlap)
    }

    @ReactProp(name = "isSelected")
    fun setIsSelected(markerView: RNMBXMarkerView, isSelected: Boolean) {
        markerView.setIsSelected(isSelected)
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXMarkerView {
        return RNMBXMarkerView(reactContext, this)
    }

    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .build()
    }

    companion object {
        const val REACT_CLASS = "RNMBXMarkerView"

        fun markerViewContainerSizeFixer(mapView: RNMBXMapView, viewAnnotationManager: ViewAnnotationManager) {
            // see https://github.com/rnmapbox/maps/issues/2376
            viewAnnotationManager.addOnViewAnnotationUpdatedListener(object :
                OnViewAnnotationUpdatedListener {
                override fun onViewAnnotationVisibilityUpdated(view: View, visible: Boolean) {
                    val parent = view.parent
                    if (parent is FrameLayout) {
                        if ((parent.width == 0 && parent.height == 0) && (mapView.width != 0 || mapView.height != 0)) {
                            parent.layout(0,0,mapView.width, mapView.height)
                        }
                    }
                }

                override fun onViewAnnotationPositionUpdated(
                    view: View,
                    leftTopCoordinate: ScreenCoordinate,
                    width: Int,
                    height: Int
                ) {
                }
            })
        }
    }
}