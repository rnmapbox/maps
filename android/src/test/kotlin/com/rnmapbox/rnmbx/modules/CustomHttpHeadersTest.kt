package com.rnmapbox.rnmbx.modules

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class CustomHttpHeadersTest {
    private val tileUrl =
        "https://tiles.example.com/v1/map?style=streets&zoom=14&x=4823&y=6122&format=png"

    @Test
    fun `substring pattern matches a url with a query string`() {
        val pattern = "https://tiles.example.com/v1/map".toRegex()

        // Kotlin Regex.matches requires the pattern to cover the whole input.
        assertFalse(pattern.matches(tileUrl))
        assertTrue(urlRegexpMatches(pattern, tileUrl))
    }

    @Test
    fun `pattern matches when the url has no extra characters`() {
        val pattern = "https://tiles.example.com/v1/map".toRegex()
        assertTrue(urlRegexpMatches(pattern, "https://tiles.example.com/v1/map"))
    }

    @Test
    fun `anchored pattern still has to match the whole url`() {
        val pattern = "^https://api\\.mapbox\\.com/(.*)$".toRegex()

        assertTrue(
            urlRegexpMatches(
                pattern,
                "https://api.mapbox.com/styles/v1/mapbox/streets-v11",
            ),
        )
        assertFalse(urlRegexpMatches(pattern, tileUrl))
        assertFalse(
            urlRegexpMatches(
                pattern,
                "https://evil.example/https://api.mapbox.com/styles/v1/mapbox/streets-v11",
            ),
        )
    }

    @Test
    fun `anchored pattern does not match a longer url`() {
        val pattern = "^https://tiles\\.example\\.com/v1/map$".toRegex()
        assertFalse(urlRegexpMatches(pattern, tileUrl))
        assertTrue(urlRegexpMatches(pattern, "https://tiles.example.com/v1/map"))
    }
}
