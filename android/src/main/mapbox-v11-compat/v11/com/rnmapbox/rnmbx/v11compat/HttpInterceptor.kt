package com.rnmapbox.rnmbx.v11compat.httpinterceptor;

import com.mapbox.common.*

open class HttpServiceBase : HttpServiceInterceptorInterface {

    override fun onRequest(
        request: HttpRequest,
        continuation: HttpServiceInterceptorRequestContinuation
    ) {
        val request = onRequest(request)
        continuation.run(HttpRequestOrResponse(request))
    }

    override fun onResponse(
        response: HttpResponse,
        continuation: HttpServiceInterceptorResponseContinuation
    ) {
        continuation.run(onResponse(response))
    }

    open fun onRequest(request: HttpRequest): HttpRequest {
        return request
    }

    open fun onDownload(download: DownloadOptions): DownloadOptions {
        return download
    }

    open fun onResponse(response: HttpResponse): HttpResponse {
        return response
    }

    open fun onUpload(options: UploadOptions): UploadOptions {
        return options
    }
}