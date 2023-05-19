package com.mapbox.rctmgl.components.styles.sources

import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.mapbox.rctmgl.components.AbstractEventEmitter
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.common.MapBuilder


class RCTMGLLineSourceManager(private val mContext: ReactApplicationContext) :
    AbstractEventEmitter<RCTMGLLineSource>(
        mContext
    ) {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLLineSource {
        return RCTMGLLineSource(reactContext, this)
    }

    override fun getChildAt(source: RCTMGLLineSource, childPosition: Int): View {
        return source.getChildAt(childPosition)
    }

    override fun getChildCount(source: RCTMGLLineSource): Int {
        return source.childCount
    }

    override fun addView(source: RCTMGLLineSource, childView: View, childPosition: Int) {
        source.addLayer(childView, getChildCount(source))
    }

    override fun removeViewAt(source: RCTMGLLineSource, childPosition: Int) {
        source.removeLayer(childPosition)
    }

    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .build()
    }

    @ReactProp(name = "id")
    fun setId(source: RCTMGLLineSource, id: String) {
        source.iD = id
    }

    @ReactProp(name = "lineString")
    fun setLine(source: RCTMGLLineSource, lineString: String) {
        source.setLineString(lineString)
    }

    @ReactProp(name = "startOffset")
    fun setStartOffset(source: RCTMGLLineSource, startOffset: Double) {
        source.setStartOffset(startOffset)
    }

    @ReactProp(name = "endOffset")
    fun setEndOffset(source: RCTMGLLineSource, endOffset: Double) {
        source.setEndOffset(endOffset)
    }

    @ReactProp(name = "animationDuration")
    fun setAnimationDuration(source: RCTMGLLineSource, animationDuration: Float) {
        source.setAnimationDuration(animationDuration)
    }

    companion object {
        const val LOG_TAG = "RCTMGLLineSourceMgr"
        const val REACT_CLASS = "RCTMGLLineSource"
    }
}
