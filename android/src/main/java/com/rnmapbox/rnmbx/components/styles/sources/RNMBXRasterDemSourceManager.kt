package com.rnmapbox.rnmbx.components.styles.sources

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXRasterDemSourceManagerInterface
import com.rnmapbox.rnmbx.utils.Logger

// import com.rnmapbox.rnmbx.components.annotation.RNMBXCallout;
// import com.rnmapbox.rnmbx.utils.ResourceUtils;
class RNMBXRasterDemSourceManager(private val mContext: ReactApplicationContext) :
    RNMBXTileSourceManager<RNMBXRasterDemSource>(
        mContext
    ), RNMBXRasterDemSourceManagerInterface<RNMBXRasterDemSource> {
    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .build()
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXRasterDemSource {
        return RNMBXRasterDemSource(reactContext, this)
    }

    companion object {
        const val LOG_TAG = "RNMBXRasterDemSourceManager"
        const val REACT_CLASS = "RNMBXRasterDemSource"
    }

    @ReactProp(name = "existing")
    override fun setExisting(view: RNMBXRasterDemSource, value: Dynamic) {
        view.mExisting = value.asBoolean()
    }

    @ReactProp(name = "tileSize")
    override fun setTileSize(view: RNMBXRasterDemSource, value: Dynamic) {
        view.setTileSize(value.asInt())
    }
}