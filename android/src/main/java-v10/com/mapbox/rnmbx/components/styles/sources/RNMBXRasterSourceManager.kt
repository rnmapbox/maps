package com.mapbox.rnmbx.components.styles.sources

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import javax.annotation.Nonnull

class RNMBXRasterSourceManager(reactApplicationContext: ReactApplicationContext) :
    RNMBXTileSourceManager<RNMBXRasterSource?>(reactApplicationContext) {
    @Nonnull
    override fun getName(): String {
        return REACT_CLASS
    }

    @Nonnull
    override fun createViewInstance(@Nonnull reactContext: ThemedReactContext): RNMBXRasterSource {
        return RNMBXRasterSource(reactContext)
    }

    @ReactProp(name = "tileSize")
    fun setTileSize(source: RNMBXRasterSource, tileSize: Int) {
        source.setTileSize(tileSize)
    }

    override fun customEvents(): Map<String, String>? {
        return null
    }

    companion object {
        const val REACT_CLASS = "RNMBXRasterSource"
    }
}