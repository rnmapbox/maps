package com.mapbox.rctmgl.components.annotation

import android.view.View
import com.mapbox.rctmgl.utils.GeoJSONUtils.toPointGeometry
import com.facebook.react.bridge.ReactApplicationContext
import com.mapbox.rctmgl.components.AbstractEventEmitter
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext

class RCTMGLMarkerViewManager(reactApplicationContext: ReactApplicationContext?) :
    AbstractEventEmitter<RCTMGLMarkerView?>(reactApplicationContext) {
    override fun getName(): String {
        return REACT_CLASS
    }

    @ReactProp(name = "coordinate")
    fun setCoordinate(markerView: RCTMGLMarkerView, geoJSONStr: String?) {
        markerView.setCoordinate(toPointGeometry(geoJSONStr))
    }

    @ReactProp(name = "anchor")
    fun setAnchor(markerView: RCTMGLMarkerView, map: ReadableMap) {
        markerView.setAnchor(map.getDouble("x").toFloat(), map.getDouble("y").toFloat())
    }

    @ReactProp(name = "allowOverlap")
    fun setAllowOverlap(markerView: RCTMGLMarkerView, allowOverlap: Boolean) {
        markerView.setAllowOverlap(allowOverlap)
    }

    @ReactProp(name = "isSelected")
    fun setIsSelected(markerView: RCTMGLMarkerView, isSelected: Boolean) {
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
        const val REACT_CLASS = "RCTMGLMarkerView"
    }
}