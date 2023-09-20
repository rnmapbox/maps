package com.rnmapbox.rnmbx.components.images

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.DynamicFromArray
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.rnmapbox.rnmbx.components.AbstractEventEmitter
import com.rnmapbox.rnmbx.events.constants.EventKeys

class RNMBXImageManager(private val mContext: ReactApplicationContext) : AbstractEventEmitter<RNMBXImage>(
mContext
) {
    override fun getName(): String {
        return "RNMBXImage"
    }

    override fun createViewInstance(p0: ThemedReactContext): RNMBXImage {
        return RNMBXImage(mContext, this)
    }

    override fun customEvents(): MutableMap<String, String>? {
        return mutableMapOf();
    }

    // region React properties
    @ReactProp(name="name")
    fun setName(image: RNMBXImage, value: String) {
        image.name = value
    }

    @ReactProp(name="sdf")
    fun setSdf(image: RNMBXImage, value: Boolean) {
        image.sdf = value
    }

    @ReactProp(name="stretchX")
    fun setStretchX(image: RNMBXImage, value: Dynamic) {
        image.stretchX = RNMBXImagesManager.convertStretch(value) ?: listOf()
    }

    @ReactProp(name="stretchY")
    fun setStretchY(image: RNMBXImage, value: Dynamic) {
        image.stretchY = RNMBXImagesManager.convertStretch(value) ?: listOf()
    }

    @ReactProp(name="content")
    fun setContent(image: RNMBXImage, value: Dynamic) {
        image.content = RNMBXImagesManager.convertContent(value)
    }

    @ReactProp(name="scale")
    fun setScale(image: RNMBXImage, value: Double) {
        image.scale = value
    }
    // endregion

    // region React methods
    override fun receiveCommand(root: RNMBXImage, commandId: String?, args: ReadableArray?) {
        if (commandId == "refresh") {
            root.refresh()
        }
    }
    // endregion
}