package com.rnmapbox.rnmbx.components.camera

import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.rnmapbox.rnmbx.NativeRNMBXCameraModuleSpec
import com.rnmapbox.rnmbx.components.mapview.CommandResponse
import com.rnmapbox.rnmbx.utils.ViewRefTag
import com.rnmapbox.rnmbx.utils.ViewTagResolver


class RNMBXCameraModule(context: ReactApplicationContext, val viewTagResolver: ViewTagResolver) : NativeRNMBXCameraModuleSpec(context) {
    private fun withViewportOnUIThread(
        viewRef: ViewRefTag?,
        reject: Promise,
        fn: (RNMBXCamera) -> Unit
    ) {
        if (viewRef == null) {
            reject.reject(Exception("viewRef is null"))
        } else {
            viewTagResolver.withViewResolved(viewRef.toInt(), reject, fn)
        }
    }

    private fun createCommandResponse(promise: Promise): CommandResponse = object : CommandResponse {
        override fun success(builder: (WritableMap) -> Unit) {
            val payload: WritableMap = WritableNativeMap()
            builder(payload)

            promise.resolve(payload)
        }

        override fun error(message: String) {
            promise.reject(Exception(message))
        }
    }

    companion object {
      const val NAME = "RNMBXCameraModule"
    }

    override fun updateCameraStop(viewRef: ViewRefTag?, stop: ReadableMap, promise: Promise) {
        withViewportOnUIThread(viewRef, promise) {
            it.updateCameraStop(stop)
            promise.resolve(null)
        }
    }
}