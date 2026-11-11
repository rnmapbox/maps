package com.rnmapbox.rnmbx.modules

import com.mapbox.common.HttpRequest
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import java.util.concurrent.CountDownLatch
import java.util.concurrent.atomic.AtomicReference
import kotlin.concurrent.thread

class CustomHttpHeadersTest {
    private val tileUrl =
        "https://tiles.example.com/v1/map?style=streets&zoom=14&x=4823&y=6122&format=png"

    @AfterEach
    fun tearDown() {
        CustomHttpHeaders.headers.keys.forEach { CustomHttpHeaders.removeCustomHeader(it) }
    }

    private fun request(url: String, headers: HashMap<String, String> = hashMapOf()): HttpRequest = mock {
        on { this.url } doReturn url
        on { this.headers } doReturn headers
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
        CustomHttpHeaders.addCustomHeader(
            "X-Anchored",
            "anchored",
            CustomHttpHeadersOptions(urlRegexp = "^https://tiles\\.example\\.com/".toRegex()),
        )
        CustomHttpHeaders.addCustomHeader("X-Global", "global")

        assertEquals(
            mapOf("X-Anchored" to "anchored", "X-Global" to "global"),
            CustomHttpHeaders.getCustomRequestHeaders(CustomHttpHeaders.headers, request(tileUrl)),
        )
        assertEquals(
            mapOf("X-Global" to "global"),
            CustomHttpHeaders.getCustomRequestHeaders(
                CustomHttpHeaders.headers,
                request("https://tiles.example.com.evil.com/v1/map"),
            ),
        )
    }

    @Test
    fun `removeCustomHeader stops sending the header`() {
        CustomHttpHeaders.addCustomHeader("X-Global", "global")
        CustomHttpHeaders.removeCustomHeader("X-Global")

        assertEquals(
            emptyMap<String, String>(),
            CustomHttpHeaders.getCustomRequestHeaders(CustomHttpHeaders.headers, request(tileUrl)),
        )
    }

    @Test
    fun `getCustomRequestHeaders uses the headers it is given`() {
        CustomHttpHeaders.addCustomHeader("X-Published", "published")

        assertEquals(
            mapOf("X-Given" to "given"),
            CustomHttpHeaders.getCustomRequestHeaders(
                mapOf("X-Given" to CustomHttpHeadersMapValue(headerValue = "given", options = null)),
                request(tileUrl),
            ),
        )
    }

    @Test
    fun `Authorization is kept when no custom headers are set`() {
        val headers = hashMapOf("Authorization" to "Bearer token")
        CustomHttpHeaders.addCustomHeader("X-Global", "global")
        CustomHttpHeaders.removeCustomHeader("X-Global")

        CustomHttpHeaders.applyTo(request(tileUrl, headers))

        assertEquals(mapOf("Authorization" to "Bearer token"), headers)
    }

    @Test
    fun `Authorization is replaced by custom headers when they are set`() {
        val headers = hashMapOf("Authorization" to "Bearer token")
        CustomHttpHeaders.addCustomHeader("X-Global", "global")

        CustomHttpHeaders.applyTo(request(tileUrl, headers))

        assertEquals(mapOf("X-Global" to "global"), headers)
    }

    @Test
    fun `adding and removing headers while requests read them does not fail`() {
        val request: HttpRequest = mock(stubOnly = true) {
            on { url } doReturn tileUrl
            on { headers } doReturn hashMapOf()
        }
        val failure = AtomicReference<Throwable?>(null)
        val start = CountDownLatch(1)
        val end = System.currentTimeMillis() + 3000
        val writer = thread(name = "native-module-writer") {
            start.await()
            var i = 0
            while (System.currentTimeMillis() < end && failure.get() == null) {
                CustomHttpHeaders.addCustomHeader("X-Header-${i % 64}", "v$i")
                CustomHttpHeaders.removeCustomHeader("X-Header-${(i + 32) % 64}")
                i++
            }
        }
        val reader = thread(name = "mapbox-http") {
            start.await()
            try {
                while (System.currentTimeMillis() < end) {
                    CustomHttpHeaders.applyTo(request)
                }
            } catch (t: Throwable) {
                failure.set(t)
            }
        }
        start.countDown()
        writer.join()
        reader.join()

        assertNull(failure.get()) { "reader failed: ${failure.get()?.stackTraceToString()}" }
    }
}
