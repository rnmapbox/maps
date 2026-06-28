package com.rnmapbox.rnmbx.components.annotation

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.RNMBXMarkerViewContentManagerDelegate
import com.facebook.react.viewmanagers.RNMBXMarkerViewContentManagerInterface
import com.rnmapbox.rnmbx.components.AbstractEventEmitter


class RNMBXMarkerViewContentManager(reactApplicationContext: ReactApplicationContext) :
    AbstractEventEmitter<RNMBXMarkerViewContent>(reactApplicationContext),
    RNMBXMarkerViewContentManagerInterface<RNMBXMarkerViewContent> {

    private val delegate = RNMBXMarkerViewContentManagerDelegate<RNMBXMarkerViewContent, RNMBXMarkerViewContentManager>(this)

    override fun getDelegate(): ViewManagerDelegate<RNMBXMarkerViewContent> = delegate

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(context: ThemedReactContext): RNMBXMarkerViewContent {
        return RNMBXMarkerViewContent(context)
    }

    override fun customEvents(): Map<String, String> {
        return mapOf("topAnnotationPosition" to "onAnnotationPosition")
    }

    companion object {
        const val REACT_CLASS = "RNMBXMarkerViewContent"
    }
}