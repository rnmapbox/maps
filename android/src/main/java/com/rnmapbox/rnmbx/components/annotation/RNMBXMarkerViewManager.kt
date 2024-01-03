package com.rnmapbox.rnmbx.components.annotation

import android.view.View
import android.widget.FrameLayout
import com.facebook.react.bridge.Dynamic
import com.rnmapbox.rnmbx.utils.GeoJSONUtils.toPointGeometry
import com.facebook.react.bridge.ReactApplicationContext
import com.rnmapbox.rnmbx.components.AbstractEventEmitter
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.RNMBXMarkerViewManagerDelegate
import com.facebook.react.viewmanagers.RNMBXMarkerViewManagerInterface
import com.mapbox.maps.ScreenCoordinate
import com.mapbox.maps.viewannotation.ViewAnnotationManager
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.v11compat.annotation.*
import com.rnmapbox.rnmbx.utils.LatLng
import com.rnmapbox.rnmbx.utils.GeoJSONUtils.toGNPointGeometry

class RNMBXMarkerViewManager(reactApplicationContext: ReactApplicationContext) :
    AbstractEventEmitter<RNMBXMarkerView>(reactApplicationContext),
    RNMBXMarkerViewManagerInterface<RNMBXMarkerView> {
    private val mDelegate: ViewManagerDelegate<RNMBXMarkerView>

    init {
        mDelegate = RNMBXMarkerViewManagerDelegate(this)
    }

    override fun getDelegate(): ViewManagerDelegate<RNMBXMarkerView> {
        return mDelegate
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    @ReactProp(name = "coordinate")
    override fun setCoordinate(markerView: RNMBXMarkerView, value: Dynamic) {
        val array = value.asArray()
        markerView.setCoordinate(toGNPointGeometry(LatLng(array.getDouble(1), array.getDouble(0))))
    }

    @ReactProp(name = "anchor")
    override fun setAnchor(markerView: RNMBXMarkerView, map: Dynamic) {
        markerView.setAnchor(map.asMap().getDouble("x").toFloat(), map.asMap().getDouble("y").toFloat())
    }

    @ReactProp(name = "allowOverlap")
    override fun setAllowOverlap(markerView: RNMBXMarkerView, allowOverlap: Dynamic) {
        markerView.setAllowOverlap(allowOverlap.asBoolean())
    }

    @ReactProp(name = "allowOverlapWithPuck")
    override fun setAllowOverlapWithPuck(markerView: RNMBXMarkerView, allowOverlapWithPuck: Dynamic) {
        markerView.setAllowOverlapWithPuck(allowOverlapWithPuck.asBoolean())
    }

    @ReactProp(name = "isSelected")
    override fun setIsSelected(markerView: RNMBXMarkerView, isSelected: Dynamic) {
        markerView.setIsSelected(isSelected.asBoolean())
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
                OnViewAnnotationUpdatedListener() {
                override fun onViewAnnotationVisibilityUpdated(view: View, visible: Boolean) {
                    val parent = view.parent
                    if (parent is FrameLayout) {
                        if ((parent.width == 0 && parent.height == 0) && (mapView.width != 0 || mapView.height != 0)) {
                            parent.layout(0,0,mapView.width, mapView.height)
                        }
                    }
                }


            })
        }
    }
}