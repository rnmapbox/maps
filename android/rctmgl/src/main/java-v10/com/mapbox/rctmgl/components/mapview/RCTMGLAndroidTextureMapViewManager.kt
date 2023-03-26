package com.mapbox.rctmgl.components.mapview

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext

//import com.mapbox.mapboxsdk.maps.MapboxMapOptions;
/**
 * Created by hernanmateo on 12/11/18.
 */
class RCTMGLAndroidTextureMapViewManager(context: ReactApplicationContext?) : RCTMGLMapViewManager(
    context!!
) {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): RCTMGLAndroidTextureMapView {
        //MapboxMapOptions options = new MapboxMapOptions();
        //options.textureMode(true);
        val context = activity ?: themedReactContext
        return RCTMGLAndroidTextureMapView(context, this /*, options*/)
    }

    companion object {
        const val LOG_TAG = "RCTMGLAndroidTextureMapViewManager"
        const val REACT_CLASS = "RCTMGLAndroidTextureMapView"
    }
}