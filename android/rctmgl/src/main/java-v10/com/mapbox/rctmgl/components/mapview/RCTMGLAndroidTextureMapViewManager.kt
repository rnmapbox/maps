package com.mapbox.rctmgl.components.mapview

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.mapbox.maps.MapInitOptions

class RCTMGLAndroidTextureMapViewManager(context: ReactApplicationContext) : RCTMGLMapViewManager(
    context
) {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): RCTMGLMapView {
        val context = getMapViewContext(themedReactContext)
        val options = MapInitOptions(context = context, textureView= true)
        return RCTMGLMapView(context, this, options)
    }

    companion object {
        const val REACT_CLASS = "RCTMGLAndroidTextureMapView"
    }
}