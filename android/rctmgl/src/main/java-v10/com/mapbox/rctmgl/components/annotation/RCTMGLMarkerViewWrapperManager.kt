package com.mapbox.rctmgl.components.annotation

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager

class RCTMGLMarkerViewWrapperManager(reactApplicationContext: ReactApplicationContext?) :
    ViewGroupManager<RCTMGLMarkerViewWrapper>() {

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLMarkerViewWrapper {
        return RCTMGLMarkerViewWrapper(reactContext, this)
    }

    companion object {
        const val REACT_CLASS = "RCTMGLMarkerViewWrapper"
    }
}