package com.rnmapbox.rnmbx.components.styles.sources

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXVectorSourceManagerInterface
import com.rnmapbox.rnmbx.events.constants.EventKeys
import javax.annotation.Nonnull

class RNMBXVectorSourceManager(reactApplicationContext: ReactApplicationContext) :
    RNMBXTileSourceManager<RNMBXVectorSource?>(reactApplicationContext),
    RNMBXVectorSourceManagerInterface<RNMBXVectorSource> {
    @Nonnull
    override fun getName(): String {
        return REACT_CLASS
    }

    @Nonnull
    override fun createViewInstance(@Nonnull reactContext: ThemedReactContext): RNMBXVectorSource {
        return RNMBXVectorSource(reactContext, this)
    }

    @ReactProp(name = "hasPressListener")
    override fun setHasPressListener(source: RNMBXVectorSource, hasPressListener: Dynamic) {
        source.setHasPressListener(hasPressListener.asBoolean())
    }

    @ReactProp(name = "hitbox")
    override fun setHitbox(source: RNMBXVectorSource, map: Dynamic) {
        source.setHitbox(map.asMap())
    }

    @ReactProp(name = "existing")
    override fun setExisting(view: RNMBXVectorSource, value: Dynamic) {
        view.mExisting = value.asBoolean()
    }

    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .put(EventKeys.VECTOR_SOURCE_LAYER_CLICK, "onMapboxVectorSourcePress")
            .put(EventKeys.MAP_ANDROID_CALLBACK, "onAndroidCallback")
            .build()
    }

    companion object {
        const val REACT_CLASS = "RNMBXVectorSource"
    }
}