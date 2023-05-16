package com.mapbox.rctmgl.components.styles.sources

import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.mapbox.rctmgl.components.AbstractEventEmitter
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.common.MapBuilder


class RCTMGLPointSourceManager(private val mContext: ReactApplicationContext) :
    AbstractEventEmitter<RCTMGLPointSource>(
        mContext
    ) {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLPointSource {
        return RCTMGLPointSource(reactContext, this)
    }

    override fun getChildAt(source: RCTMGLPointSource, childPosition: Int): View {
        return source.getChildAt(childPosition)
    }

    override fun getChildCount(source: RCTMGLPointSource): Int {
        return source.childCount
    }

    override fun addView(source: RCTMGLPointSource, childView: View, childPosition: Int) {
        source.addLayer(childView, getChildCount(source))
    }

    override fun removeViewAt(source: RCTMGLPointSource, childPosition: Int) {
        source.removeLayer(childPosition)
    }

    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .build()
    }

    @ReactProp(name = "id")
    fun setId(source: RCTMGLPointSource, id: String) {
        source.iD = id
    }

    @ReactProp(name = "point")
    fun setPoint(source: RCTMGLPointSource, point: String) {
        source.setPoint(point)
    }

    @ReactProp(name = "animationDuration")
    fun setAnimationDuration(source: RCTMGLPointSource, animationDuration: Float) {
        source.setAnimationDuration(animationDuration)
    }

    companion object {
        const val LOG_TAG = "RCTMGLPointSourceMgr"
        const val REACT_CLASS = "RCTMGLPointSource"
    }
}
