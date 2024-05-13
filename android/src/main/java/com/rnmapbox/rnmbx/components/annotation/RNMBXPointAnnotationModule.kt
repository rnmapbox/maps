package com.rnmapbox.rnmbx.components.annotation

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.rnmapbox.rnmbx.NativeRNMBXPointAnnotationModuleSpec
import com.rnmapbox.rnmbx.utils.ViewRefTag
import com.rnmapbox.rnmbx.utils.ViewTagResolver

@ReactModule(name = RNMBXPointAnnotationModule.NAME)
class RNMBXPointAnnotationModule(reactContext: ReactApplicationContext?, private val viewTagResolver: ViewTagResolver) :
    NativeRNMBXPointAnnotationModuleSpec(reactContext) {

    companion object {
        const val NAME = "RNMBXPointAnnotationModule"
    }

    private fun withPointAnnotationOnUIThread(viewRef: ViewRefTag?, reject: Promise, fn: (RNMBXPointAnnotation) -> Unit) {
        if (viewRef == null) {
            reject.reject(Exception("viewRef is null for RNMBXPointAnnotation"))
        } else {
            viewTagResolver.withViewResolved(viewRef.toInt(), reject, fn)
        }
    }

    @ReactMethod
    override fun refresh(viewRef: ViewRefTag?, promise: Promise) {
        withPointAnnotationOnUIThread(viewRef, promise) {
            it.refresh()
            promise.resolve(null)
        }
    }
}