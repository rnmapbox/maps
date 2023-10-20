package com.rnmapbox.rnmbx.components.mapview

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.RNMBXAndroidTextureMapViewManagerDelegate
import com.facebook.react.viewmanagers.RNMBXAndroidTextureMapViewManagerInterface
import com.facebook.react.viewmanagers.RNMBXMapViewManagerDelegate
import com.mapbox.maps.MapInitOptions
import com.rnmapbox.rnmbx.utils.ViewTagResolver

class RNMBXAndroidTextureMapViewManager(context: ReactApplicationContext, viewTagResolver: ViewTagResolver) : RNMBXMapViewManager(
    context,
    viewTagResolver
), RNMBXAndroidTextureMapViewManagerInterface<RNMBXMapView> {
    private val mDelegate: ViewManagerDelegate<RNMBXMapView>

    init {
        mDelegate = RNMBXAndroidTextureMapViewManagerDelegate<RNMBXMapView, RNMBXAndroidTextureMapViewManager>(this)
    }

    override fun getDelegate(): ViewManagerDelegate<RNMBXMapView>? {
        return mDelegate
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): RNMBXMapView {
        val context = getMapViewContext(themedReactContext)
        val options = MapInitOptions(context = context, textureView= true)
        return RNMBXMapView(context, this, options)
    }

    companion object {
        const val REACT_CLASS = "RNMBXAndroidTextureMapView"
    }
}