package com.rnmapbox.rnmbx.components.styles.sources

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.UIManagerType
import com.rnmapbox.rnmbx.BuildConfig
import com.rnmapbox.rnmbx.NativeRNMBXShapeSourceModuleSpec

@ReactModule(name = RNMBXShapeSourceModule.NAME)
class RNMBXShapeSourceModule(reactContext: ReactApplicationContext?) :
    NativeRNMBXShapeSourceModuleSpec(reactContext) {

    private fun withShapeSourceOnUIThread(viewRef: Double?, promise: Promise, fn: (RNMBXShapeSource) -> Unit) {
        if (viewRef == null) {
            promise.reject(Exception("viewRef is null for RNMBXShapeSource"))
        } else {

            reactApplicationContext.runOnUiQueueThread {
                val manager = if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED)
                    UIManagerHelper.getUIManager(reactApplicationContext, UIManagerType.FABRIC)
                else
                    UIManagerHelper.getUIManager(reactApplicationContext, UIManagerType.DEFAULT)

                val view = manager?.resolveView(viewRef.toInt()) as? RNMBXShapeSource

                if (view != null) {
                    fn(view)
                } else {
                    promise.reject(Exception("cannot find map view for tag ${viewRef.toInt()}"))
                }
            }
        }
    }

    companion object {
        const val NAME = "RNMBXShapeSourceModule"
    }

    @ReactMethod
    override fun getClusterExpansionZoom(
        viewRef: Double?,
        featureJSON: String,
        promise: Promise
    ) {
        withShapeSourceOnUIThread(viewRef, promise) {
            it.getClusterExpansionZoom(featureJSON, promise)
        }
    }

    @ReactMethod
    override fun getClusterLeaves(
        viewRef: Double?,
        featureJSON: String,
        number: Double,
        offset: Double,
        promise: Promise
    ) {
        withShapeSourceOnUIThread(viewRef, promise) {
            it.getClusterLeaves(featureJSON, number.toInt(), offset.toInt(), promise)
        }
    }

    @ReactMethod
    override fun getClusterChildren(viewRef: Double?, featureJSON: String, promise: Promise) {
        withShapeSourceOnUIThread(viewRef, promise) {
            it.getClusterChildren(featureJSON, promise)
        }
    }
}