package com.mapbox.rctmgl.modules

import com.mapbox.common.*

object CustomHttpHeaders : HttpServiceInterceptorInterface {
    init {}

    val map = mutableMapOf<String, String>()

    fun addCustomHeader(headerName: String, headerValue: String) {
        HttpServiceFactory.getInstance().setInterceptor(
            this
        )
        map.put(headerName, headerValue)
    }

    fun removeCustomHeader(headerName: String) {
        map.remove(headerName)
    }

    override fun onRequest(request: HttpRequest): HttpRequest {
        for (entry in map.entries.iterator()) {
            request.headers[entry.key] = entry.value
        }
        return request
    }

    override fun onDownload(download: DownloadOptions): DownloadOptions {
        for (entry in map.entries.iterator()) {
            download.request.headers[entry.key] = entry.value
        }
        return download
    }

    override fun onResponse(response: HttpResponse): HttpResponse {
        return response
    }
}

