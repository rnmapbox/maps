package com.rnmapbox.rnmbx.components.annotation

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXPointAnnotationManagerManagerInterface
import com.rnmapbox.rnmbx.components.AbstractEventEmitter

class RNMBXPointAnnotationManagerViewManager(context: ReactApplicationContext) :
    AbstractEventEmitter<RNMBXPointAnnotationManagerView>(context),
    RNMBXPointAnnotationManagerManagerInterface<RNMBXPointAnnotationManagerView> {
    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>().build()
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(context: ThemedReactContext): RNMBXPointAnnotationManagerView {
        return RNMBXPointAnnotationManagerView(context)
    }

    companion object {
        const val REACT_CLASS = "RNMBXPointAnnotationManager"
    }

    @ReactProp(name = "slot")
    override fun setSlot(view: RNMBXPointAnnotationManagerView, value: Dynamic) {
        view.slot = if (value.isNull) null else value.asString()
    }
}
