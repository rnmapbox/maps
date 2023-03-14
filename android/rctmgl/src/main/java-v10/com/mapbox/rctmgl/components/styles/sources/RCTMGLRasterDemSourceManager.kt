package com.mapbox.rctmgl.components.styles.sources

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext

// import com.mapbox.rctmgl.components.annotation.RCTMGLCallout;
// import com.mapbox.rctmgl.utils.ResourceUtils;
class RCTMGLRasterDemSourceManager(private val mContext: ReactApplicationContext) :
    RCTMGLTileSourceManager<RCTMGLRasterDemSource?>(
        mContext
    ) {
    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .build()
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLRasterDemSource {
        return RCTMGLRasterDemSource(reactContext, this)
    }

    companion object {
        const val LOG_TAG = "RCTMGLRasterDemSourceManager"
        const val REACT_CLASS = "RCTMGLRasterDemSource"
    }
}