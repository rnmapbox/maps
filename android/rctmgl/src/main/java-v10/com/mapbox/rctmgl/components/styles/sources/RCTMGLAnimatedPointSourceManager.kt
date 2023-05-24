package com.mapbox.rctmgl.components.styles.sources

import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.mapbox.rctmgl.components.AbstractEventEmitter
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.common.MapBuilder


class RCTMGLAnimatedPointSourceManager(private val mContext: ReactApplicationContext) :
    AbstractEventEmitter<RCTMGLAnimatedPointSource>(
        mContext
    ) {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLAnimatedPointSource {
        return RCTMGLAnimatedPointSource(reactContext, this)
    }

    override fun getChildAt(source: RCTMGLAnimatedPointSource, childPosition: Int): View {
        return source.getChildAt(childPosition)
    }

    override fun getChildCount(source: RCTMGLAnimatedPointSource): Int {
        return source.childCount
    }

    override fun addView(source: RCTMGLAnimatedPointSource, childView: View, childPosition: Int) {
        source.addLayer(childView, getChildCount(source))
    }

    override fun removeViewAt(source: RCTMGLAnimatedPointSource, childPosition: Int) {
        source.removeLayer(childPosition)
    }

    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .build()
    }

    @ReactProp(name = "id")
    fun setId(source: RCTMGLAnimatedPointSource, id: String) {
        source.iD = id
    }

    @ReactProp(name = "point")
    fun setPoint(source: RCTMGLAnimatedPointSource, point: String) {
        source.setPoint(point)
    }

    @ReactProp(name = "animationDuration")
    fun setAnimationDuration(source: RCTMGLAnimatedPointSource, animationDuration: Float) {
        source.setAnimationDuration(animationDuration)
    }

    @ReactProp(name = "snapIfDistanceIsGreaterThan")
    fun setSnapIfDistanceIsGreaterThan(source: RCTMGLAnimatedPointSource, snapIfDistanceIsGreaterThan: Float) {
        source.setSnapIfDistanceIsGreaterThan(snapIfDistanceIsGreaterThan)
    }

    companion object {
        const val LOG_TAG = "RCTMGLAnimatedPointSourceMgr"
        const val REACT_CLASS = "RCTMGLAnimatedPointSource"
    }
}
