package com.rnmapbox.rnmbx.modules

import com.mapbox.common.*
import com.rnmapbox.rnmbx.v11compat.httpinterceptor.*

data class CustomHttpHeadersOptions(val urlRegexp: Regex?)

data class CustomHttpHeadersMapValue(
    val headerValue: String,
    val options: CustomHttpHeadersOptions?
)

object CustomHttpHeaders : HttpServiceBase() {
    const val LOG_TAG = "CustomHttpHeaders"

    init {}

    val map = mutableMapOf<String, CustomHttpHeadersMapValue>()

    fun addCustomHeader(headerName: String, headerValue: String, options: CustomHttpHeadersOptions? = null) {
        HttpServiceFactory.getInstance().setInterceptor(
            this
        )
        map.put(headerName, CustomHttpHeadersMapValue(headerValue = headerValue, options = options))
    }

    fun removeCustomHeader(headerName: String) {
        map.remove(headerName)
    }

    fun getCustomRequestHeaders(customRequestHeaders: MutableMap<String, CustomHttpHeadersMapValue>, httpRequest: HttpRequest): HashMap<String, String> {
        val headers = hashMapOf<String, String>()
        for (entry in map.entries.iterator()) {
            val urlRegexp = entry.value.options?.urlRegexp
            if (urlRegexp != null) {
                val destination = httpRequest.headers.getOrDefault("location", httpRequest.url)
                if (urlRegexp.matches(destination)) {
                    headers[entry.key] = entry.value.headerValue
                }
            }
            else {
                headers[entry.key] = entry.value.headerValue
            }
        }
        return headers
    }

    override fun onRequest(request: HttpRequest): HttpRequest {
        request.headers.remove("Authorization")
        request.headers.putAll(getCustomRequestHeaders(map, request))
        return request
    }

    override fun onDownload(download: DownloadOptions): DownloadOptions {
        download.request.headers.putAll(getCustomRequestHeaders(map, download.request))
        return download
    }

    override fun onResponse(response: HttpResponse): HttpResponse {
        return response
    }
}

