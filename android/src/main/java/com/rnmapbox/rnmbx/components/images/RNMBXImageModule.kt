package com.rnmapbox.rnmbx.components.images

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.rnmapbox.rnmbx.NativeRNMBXImageModuleSpec
import com.rnmapbox.rnmbx.utils.ViewRefTag
import com.rnmapbox.rnmbx.utils.ViewTagResolver

@ReactModule(name = RNMBXImageModule.NAME)
class RNMBXImageModule(reactContext: ReactApplicationContext?, private val viewTagResolver: ViewTagResolver) :
    NativeRNMBXImageModuleSpec(reactContext) {

    companion object {
        const val NAME = "RNMBXImageModule"
    }

    private fun withImageOnUIThread(viewRef: ViewRefTag?, reject: Promise, fn: (RNMBXImage) -> Unit) {
        if (viewRef == null) {
            reject.reject(Exception("viewRef is null for RNMBXImage"))
        } else {
            viewTagResolver.withViewResolved(viewRef.toInt(), reject, fn)
        }
    }

    @ReactMethod
    override fun refresh(viewRef: ViewRefTag?, promise: Promise) {
        withImageOnUIThread(viewRef, promise) {
            it.refresh()
            promise.resolve(null)
        }
    }
}