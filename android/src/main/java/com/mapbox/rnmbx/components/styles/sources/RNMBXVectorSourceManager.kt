package com.mapbox.rnmbx.components.styles.sources

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.mapbox.rnmbx.events.constants.EventKeys
import com.mapbox.rnmbx.utils.ConvertUtils
import com.mapbox.rnmbx.utils.ExpressionParser
import javax.annotation.Nonnull

class RNMBXVectorSourceManager(reactApplicationContext: ReactApplicationContext) :
    RNMBXTileSourceManager<RNMBXVectorSource?>(reactApplicationContext) {
    @Nonnull
    override fun getName(): String {
        return REACT_CLASS
    }

    @Nonnull
    override fun createViewInstance(@Nonnull reactContext: ThemedReactContext): RNMBXVectorSource {
        return RNMBXVectorSource(reactContext, this)
    }

    @ReactProp(name = "hasPressListener")
    fun setHasPressListener(source: RNMBXVectorSource, hasPressListener: Boolean) {
        source.setHasPressListener(hasPressListener)
    }

    @ReactProp(name = "hitbox")
    fun setHitbox(source: RNMBXVectorSource, map: ReadableMap?) {
        source.setHitbox(map!!)
    }

    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .put(EventKeys.VECTOR_SOURCE_LAYER_CLICK, "onMapboxVectorSourcePress")
            .put(EventKeys.MAP_ANDROID_CALLBACK, "onAndroidCallback")
            .build()
    }

    override fun getCommandsMap(): Map<String, Int>? {
        return MapBuilder.builder<String, Int>()
            .put("features", METHOD_FEATURES)
            .build()
    }

    override fun receiveCommand(
        vectorSource: RNMBXVectorSource,
        commandID: Int,
        args: ReadableArray?
    ) {
        when (commandID) {
            METHOD_FEATURES -> vectorSource.querySourceFeatures(
                args!!.getString(0),
                ConvertUtils.toStringList(args.getArray(1)),
                ExpressionParser.from(args.getArray(2))
            )
        }
    }

    companion object {
        const val REACT_CLASS = "RNMBXVectorSource"

        //region React Methods
        const val METHOD_FEATURES = 102
    }
}