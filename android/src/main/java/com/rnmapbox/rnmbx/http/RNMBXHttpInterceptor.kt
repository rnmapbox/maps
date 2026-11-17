package com.rnmapbox.rnmbx.http

import com.mapbox.common.HttpRequest
import com.mapbox.common.HttpRequestOrResponse
import com.mapbox.common.HttpResponse
import com.mapbox.common.HttpServiceFactory
import com.mapbox.common.HttpServiceInterceptorInterface
import com.mapbox.common.HttpServiceInterceptorRequestContinuation
import com.mapbox.common.HttpServiceInterceptorResponseContinuation
import com.rnmapbox.rnmbx.modules.CustomHttpHeaders

/**
 * The single interceptor rnmapbox registers with Mapbox. Mapbox has one global interceptor slot,
 * so every request-level feature runs as a step in here.
 */
object RNMBXHttpInterceptor : HttpServiceInterceptorInterface {
    private var installed = false

    /** Installed on first use, so apps that never need it leave Mapbox's slot free. Call from the native-module thread. */
    fun install() {
        if (installed) return
        HttpServiceFactory.setHttpServiceInterceptor(this)
        installed = true
    }

    override fun onRequest(request: HttpRequest, continuation: HttpServiceInterceptorRequestContinuation) {
        CustomHttpHeaders.applyTo(request)
        continuation.run(HttpRequestOrResponse(request))
    }

    // Also called for responses a step answers itself, not just network responses.
    override fun onResponse(response: HttpResponse, continuation: HttpServiceInterceptorResponseContinuation) {
        continuation.run(response)
    }
}
