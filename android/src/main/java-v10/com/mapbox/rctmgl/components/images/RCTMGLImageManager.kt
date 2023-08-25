package com.mapbox.rctmgl.components.images

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.DynamicFromArray
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.mapbox.rctmgl.components.AbstractEventEmitter
import com.mapbox.rctmgl.events.constants.EventKeys

class RCTMGLImageManager(private val mContext: ReactApplicationContext) : AbstractEventEmitter<RCTMGLImage>(
mContext
) {
    override fun getName(): String {
        return "RCTMGLImage"
    }

    override fun createViewInstance(p0: ThemedReactContext): RCTMGLImage {
        return RCTMGLImage(mContext, this)
    }

    override fun customEvents(): MutableMap<String, String>? {
        return mutableMapOf();
    }

    // region React properties
    @ReactProp(name="name")
    fun setName(image: RCTMGLImage, value: String) {
        image.name = value
    }

    @ReactProp(name="sdf")
    fun setSdf(image: RCTMGLImage, value: Boolean) {
        image.sdf = value
    }

    @ReactProp(name="stretchX")
    fun setStretchX(image: RCTMGLImage, value: Dynamic) {
        image.stretchX = RCTMGLImagesManager.convertStretch(value) ?: listOf()
    }

    @ReactProp(name="stretchY")
    fun setStretchY(image: RCTMGLImage, value: Dynamic) {
        image.stretchY = RCTMGLImagesManager.convertStretch(value) ?: listOf()
    }

    @ReactProp(name="content")
    fun setContent(image: RCTMGLImage, value: Dynamic) {
        image.content = RCTMGLImagesManager.convertContent(value)
    }

    @ReactProp(name="scale")
    fun setScale(image: RCTMGLImage, value: Double) {
        image.scale = value
    }
    // endregion

    // region React methods
    override fun receiveCommand(root: RCTMGLImage, commandId: String?, args: ReadableArray?) {
        if (commandId == "refresh") {
            root.refresh()
        }
    }
    // endregion
}