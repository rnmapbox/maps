package com.rnmapbox.rnmbx.modules

import com.mapbox.common.HttpRequest

data class CustomHttpHeadersOptions(val urlRegexp: Regex?)

data class CustomHttpHeadersMapValue(
    val headerValue: String,
    val options: CustomHttpHeadersOptions?
)

object CustomHttpHeaders {
    const val LOG_TAG = "CustomHttpHeaders"

    // Written only from the native-module thread (one MessageQueueThread under both the bridge and TurboModules),
    // so a write just publishes a new immutable map; @Volatile makes it visible to Mapbox's HTTP thread.
    @Volatile
    var headers: Map<String, CustomHttpHeadersMapValue> = emptyMap()
        private set

    fun addCustomHeader(headerName: String, headerValue: String, options: CustomHttpHeadersOptions? = null) {
        headers = headers + (headerName to CustomHttpHeadersMapValue(headerValue = headerValue, options = options))
    }

    fun removeCustomHeader(headerName: String) {
        headers = headers - headerName
    }

    fun getCustomRequestHeaders(customRequestHeaders: Map<String, CustomHttpHeadersMapValue>, httpRequest: HttpRequest): HashMap<String, String> {
        val headers = hashMapOf<String, String>()
        for ((name, value) in customRequestHeaders) {
            val urlRegexp = value.options?.urlRegexp
            if (urlRegexp != null) {
                val destination = httpRequest.headers.getOrDefault("location", httpRequest.url)
                if (urlRegexpMatches(urlRegexp, destination)) {
                    headers[name] = value.headerValue
                }
            }
            else {
                headers[name] = value.headerValue
            }
        }
        return headers
    }

    fun applyTo(request: HttpRequest) {
        val snapshot = headers
        if (snapshot.isEmpty()) return
        request.headers.remove("Authorization")
        request.headers.putAll(getCustomRequestHeaders(snapshot, request))
    }
}

// Search anywhere in the URL like iOS NSRegularExpression.firstMatch; Regex.matches would require a whole-URL match.
internal fun urlRegexpMatches(pattern: Regex, url: String): Boolean = pattern.containsMatchIn(url)
