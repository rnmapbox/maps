package com.rnmapbox.rnmbx.components.location

import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.rnmapbox.rnmbx.NativeRNMBXLocationModuleSpec
import com.rnmapbox.rnmbx.components.mapview.CommandResponse
import com.rnmapbox.rnmbx.utils.ViewTagResolver


class RNMBXLocationModule(context: ReactApplicationContext, val viewTagResolver: ViewTagResolver) : NativeRNMBXLocationModuleSpec(context) {
    private fun withViewportOnUIThread(
        viewRef: Double?,
        reject: Promise,
        fn: (RNMBXLocation) -> Unit
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

    override fun someMethod(viewRef: Double?, promise: Promise) {
        withViewportOnUIThread(viewRef, promise) {
            it.someMethod()
            promise.resolve(true)
        }
    }

    companion object {
      const val NAME = "RNMBXLocationModule"
    }
}
