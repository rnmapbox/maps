package com.mapbox.rctmgl.components.styles.sources

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import javax.annotation.Nonnull

class RCTMGLRasterSourceManager(reactApplicationContext: ReactApplicationContext) :
    RCTMGLTileSourceManager<RCTMGLRasterSource?>(reactApplicationContext) {
    @Nonnull
    override fun getName(): String {
        return REACT_CLASS
    }

    @Nonnull
    override fun createViewInstance(@Nonnull reactContext: ThemedReactContext): RCTMGLRasterSource {
        return RCTMGLRasterSource(reactContext)
    }

    @ReactProp(name = "tileSize")
    fun setTileSize(source: RCTMGLRasterSource, tileSize: Int) {
        source.setTileSize(tileSize)
    }

    override fun customEvents(): Map<String, String>? {
        return null
    }

    companion object {
        const val REACT_CLASS = "RCTMGLRasterSource"
    }
}