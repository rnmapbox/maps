package com.mapbox.rctmgl.components.styles.sources

import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.mapbox.rctmgl.components.AbstractEventEmitter
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.common.MapBuilder


class RCTMGLAnimatedLineSourceManager(private val mContext: ReactApplicationContext) :
    AbstractEventEmitter<RCTMGLAnimatedLineSource>(
        mContext
    ) {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLAnimatedLineSource {
        return RCTMGLAnimatedLineSource(reactContext, this)
    }

    override fun getChildAt(source: RCTMGLAnimatedLineSource, childPosition: Int): View {
        return source.getChildAt(childPosition)
    }

    override fun getChildCount(source: RCTMGLAnimatedLineSource): Int {
        return source.childCount
    }

    override fun addView(source: RCTMGLAnimatedLineSource, childView: View, childPosition: Int) {
        source.addLayer(childView, getChildCount(source))
    }

    override fun removeViewAt(source: RCTMGLAnimatedLineSource, childPosition: Int) {
        source.removeLayer(childPosition)
    }

    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .build()
    }

    @ReactProp(name = "id")
    fun setId(source: RCTMGLAnimatedLineSource, id: String) {
        source.iD = id
    }

    @ReactProp(name = "lineString")
    fun setLine(source: RCTMGLAnimatedLineSource, lineString: String) {
        source.setLineString(lineString)
    }

    @ReactProp(name = "startOffset")
    fun setStartOffset(source: RCTMGLAnimatedLineSource, startOffset: Double) {
        source.setStartOffset(startOffset)
    }

    @ReactProp(name = "endOffset")
    fun setEndOffset(source: RCTMGLAnimatedLineSource, endOffset: Double) {
        source.setEndOffset(endOffset)
    }

    @ReactProp(name = "animationDuration")
    fun setAnimationDuration(source: RCTMGLAnimatedLineSource, animationDuration: Float) {
        source.setAnimationDuration(animationDuration)
    }

    companion object {
        const val LOG_TAG = "RCTMGLAnimatedLineSourceMgr"
        const val REACT_CLASS = "RCTMGLAnimatedLineSource"
    }
}
