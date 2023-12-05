package com.rnmapbox.rnmbx.components.annotation

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.viewmanagers.RNMBXMarkerViewContentManagerInterface


class RNMBXMarkerViewContentManager(reactApplicationContext: ReactApplicationContext) :
    ViewGroupManager<RNMBXMarkerViewContent>(),
    RNMBXMarkerViewContentManagerInterface<RNMBXMarkerView> {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(context: ThemedReactContext): RNMBXMarkerViewContent {
        return RNMBXMarkerViewContent(context)
    }

    companion object {
        const val REACT_CLASS = "RNMBXMarkerViewContent"
    }
}