package com.rnmapbox.rnmbx.components.camera

import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.rnmapbox.rnmbx.NativeRNMBXViewportModuleSpec
import com.rnmapbox.rnmbx.components.mapview.CommandResponse
import com.rnmapbox.rnmbx.utils.ViewRefTag
import com.rnmapbox.rnmbx.utils.ViewTagResolver

class RNMBXViewportModule(context: ReactApplicationContext, val viewTagResolver: ViewTagResolver) : NativeRNMBXViewportModuleSpec(context) {
    private fun withViewportOnUIThread(
        viewRef: ViewRefTag?,
        reject: Promise,
        fn: (RNMBXViewport) -> Unit
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

    override fun getState(viewRef: ViewRefTag?, promise: Promise) {
        withViewportOnUIThread(viewRef, promise) {
            promise.resolve(it.getState())
        }
    }

    override fun transitionTo(
        viewRef: ViewRefTag?,
        state: ReadableMap,
        transition: ReadableMap?,
        promise: Promise
    ) {
        withViewportOnUIThread(viewRef, promise) {
            it.transitionTo(state, transition, promise)
        }
    }

    override fun idle(viewRef: ViewRefTag?, promise: Promise) {
        withViewportOnUIThread(viewRef, promise) {
            it.idle()
            promise.resolve(true)
        }
    }

    companion object {
        const val NAME = "RNMBXViewportModule"
    }
}