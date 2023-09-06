package com.mapbox.rctmgl.components.annotation

import android.view.View
import android.widget.FrameLayout
import com.mapbox.rctmgl.utils.GeoJSONUtils.toPointGeometry
import com.facebook.react.bridge.ReactApplicationContext
import com.mapbox.rctmgl.components.AbstractEventEmitter
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.MBXMapViewManagerDelegate
import com.facebook.react.viewmanagers.MBXMarkerViewManagerDelegate
import com.facebook.react.viewmanagers.MBXMarkerViewManagerInterface
import com.mapbox.maps.ScreenCoordinate
import com.mapbox.maps.viewannotation.OnViewAnnotationUpdatedListener
import com.mapbox.maps.viewannotation.ViewAnnotationManager
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.mapview.RCTMGLMapViewManager

class RCTMGLMarkerViewManager(reactApplicationContext: ReactApplicationContext) :
    AbstractEventEmitter<RCTMGLMarkerView>(reactApplicationContext), MBXMarkerViewManagerInterface<RCTMGLMarkerView> {
    private val mDelegate: ViewManagerDelegate<RCTMGLMarkerView>

    init {
        mDelegate = MBXMarkerViewManagerDelegate<RCTMGLMarkerView, RCTMGLMarkerViewManager>(this)
    }

    override fun getDelegate(): ViewManagerDelegate<RCTMGLMarkerView> {
        return mDelegate
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    @ReactProp(name = "coordinate")
    override fun setCoordinate(markerView: RCTMGLMarkerView, geoJSONStr: String?) {
        markerView.setCoordinate(toPointGeometry(geoJSONStr))
    }

    @ReactProp(name = "anchor")
    override fun setAnchor(markerView: RCTMGLMarkerView, map: ReadableMap?) {
        if (map != null) {
            markerView.setAnchor(map.getDouble("x").toFloat(), map.getDouble("y").toFloat())
        }
    }

    @ReactProp(name = "allowOverlap")
    override fun setAllowOverlap(markerView: RCTMGLMarkerView, allowOverlap: Boolean) {
        markerView.setAllowOverlap(allowOverlap)
    }

    @ReactProp(name = "isSelected")
    override fun setIsSelected(markerView: RCTMGLMarkerView, isSelected: Boolean) {
        markerView.setIsSelected(isSelected)
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLMarkerView {
        return RCTMGLMarkerView(reactContext, this)
    }

    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .build()
    }

    companion object {
        const val REACT_CLASS = "MBXMarkerView"

        fun markerViewContainerSizeFixer(mapView: RCTMGLMapView, viewAnnotationManager: ViewAnnotationManager) {
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