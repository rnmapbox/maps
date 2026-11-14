package com.rnmapbox.rnmbx.components.styles.snow

import com.facebook.react.bridge.Dynamic
import com.facebook.react.uimanager.ThemedReactContext
import com.rnmapbox.rnmbx.utils.extensions.asMapOrNull
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXSnowManagerDelegate
import com.facebook.react.viewmanagers.RNMBXSnowManagerInterface

class RNMBXSnowManager : ViewGroupManager<RNMBXSnow>(), RNMBXSnowManagerInterface<RNMBXSnow> {

    private val mDelegate: ViewManagerDelegate<RNMBXSnow>

    init {
        mDelegate = RNMBXSnowManagerDelegate(this)
    }

    override fun getDelegate(): ViewManagerDelegate<RNMBXSnow> {
        return mDelegate
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXSnow {
        return RNMBXSnow(reactContext)
    }

    @ReactProp(name = "reactStyle")
    override fun setReactStyle(snow: RNMBXSnow, reactStyle: Dynamic) {
        snow.setReactStyle(reactStyle.asMapOrNull())
    }

    companion object {
        const val REACT_CLASS = "RNMBXSnow"
    }
}
