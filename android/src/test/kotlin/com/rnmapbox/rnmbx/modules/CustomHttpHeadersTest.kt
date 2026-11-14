package com.rnmapbox.rnmbx.modules

import com.mapbox.common.HttpRequest
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock

class CustomHttpHeadersTest {
    private val tileUrl =
        "https://tiles.example.com/v1/map?style=streets&zoom=14&x=4823&y=6122&format=png"

    @AfterEach
    fun tearDown() {
        CustomHttpHeaders.map.clear()
    }

    private fun request(url: String): HttpRequest = mock {
        on { this.url } doReturn url
        on { headers } doReturn hashMapOf()
    }

    @Test
    fun `substring pattern matches a url with a query string`() {
        val pattern = "https://tiles.example.com/v1/map".toRegex()

        assertFalse(pattern.matches(tileUrl))
        assertTrue(urlRegexpMatches(pattern, tileUrl))
    }

    @Test
    fun `pattern matches when the url has no extra characters`() {
        val pattern = "https://tiles.example.com/v1/map".toRegex()
        assertTrue(urlRegexpMatches(pattern, "https://tiles.example.com/v1/map"))
    }

    @Test
    fun `fully anchored pattern only matches its host`() {
        val pattern = "^https:\\/\\/api\\.mapbox\\.com\\/(.*)$".toRegex()

        assertTrue(urlRegexpMatches(pattern, "https://api.mapbox.com/styles/v1/mapbox/streets-v11"))
        assertFalse(urlRegexpMatches(pattern, tileUrl))
        assertFalse(
            urlRegexpMatches(pattern, "https://evil.example/https://api.mapbox.com/styles/v1/mapbox/streets-v11"),
        )
    }

    @Test
    fun `anchored pattern does not match a longer url when it ends with $`() {
        val pattern = "^https://tiles\\.example\\.com/v1/map$".toRegex()
        assertFalse(urlRegexpMatches(pattern, tileUrl))
        assertTrue(urlRegexpMatches(pattern, "https://tiles.example.com/v1/map"))
    }

    @Test
    fun `start-anchored pattern rejects look-alike hosts`() {
        val pattern = "^https://tiles\\.example\\.com/".toRegex()

        assertTrue(urlRegexpMatches(pattern, tileUrl))
        assertFalse(urlRegexpMatches(pattern, "https://tiles.example.com.evil.com/v1/map"))
        assertFalse(urlRegexpMatches(pattern, "https://evil.com/?u=https://tiles.example.com/"))
    }

    @Test
    fun `unanchored pattern matches look-alike hosts`() {
        val pattern = "tiles\\.example\\.com".toRegex()
        assertTrue(urlRegexpMatches(pattern, "https://tiles.example.com.evil.com/v1/map"))
    }

    @Test
    fun `headers are added only to matching urls`() {
        CustomHttpHeaders.map["X-Anchored"] = CustomHttpHeadersMapValue(
            headerValue = "anchored",
            options = CustomHttpHeadersOptions(urlRegexp = "^https://tiles\\.example\\.com/".toRegex()),
        )
        CustomHttpHeaders.map["X-Global"] = CustomHttpHeadersMapValue(headerValue = "global", options = null)

        assertEquals(
            mapOf("X-Anchored" to "anchored", "X-Global" to "global"),
            CustomHttpHeaders.getCustomRequestHeaders(CustomHttpHeaders.map, request(tileUrl)),
        )
        assertEquals(
            mapOf("X-Global" to "global"),
            CustomHttpHeaders.getCustomRequestHeaders(
                CustomHttpHeaders.map,
                request("https://tiles.example.com.evil.com/v1/map"),
            ),
        )
    }

    @Test
    fun `removeCustomHeader stops sending the header`() {
        CustomHttpHeaders.map["X-Global"] = CustomHttpHeadersMapValue(headerValue = "global", options = null)
        CustomHttpHeaders.removeCustomHeader("X-Global")

        assertEquals(
            emptyMap<String, String>(),
            CustomHttpHeaders.getCustomRequestHeaders(CustomHttpHeaders.map, request(tileUrl)),
        )
    }
}
