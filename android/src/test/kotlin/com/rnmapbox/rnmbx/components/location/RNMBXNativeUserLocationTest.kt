package com.rnmapbox.rnmbx.components.location

import android.content.Context
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.mapbox.maps.plugin.locationcomponent.LocationComponentPlugin
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*

class RNMBXNativeUserLocationTest {
    private val location: LocationComponentPlugin = mock()
    private val context: Context = mock()
    private var enabled = false

    init {
        doAnswer { enabled = it.getArgument(0); null }
            .whenever(location).pulsingEnabled = any()
    }

    private fun request(enabled: Boolean): ReadableMap = mock {
        on { hasKey("isEnabled") } doReturn true
        on { getType("isEnabled") } doReturn ReadableType.Boolean
        on { getBoolean("isEnabled") } doReturn enabled
    }

    private fun apply(visible: Boolean, request: ReadableMap?) {
        applyLocationPuckPulsing(location, visible, request, context)
    }

    @Test
    fun `explicit pulse resumes after hide show without losing configuration`() {
        val requested = request(true)
        whenever(requested.hasKey("radius")).thenReturn(true)
        whenever(requested.getType("radius")).thenReturn(ReadableType.Number)
        whenever(requested.getDouble("radius")).thenReturn(25.0)
        whenever(requested.hasKey("color")).thenReturn(true)
        whenever(requested.getType("color")).thenReturn(ReadableType.Number)
        whenever(requested.getInt("color")).thenReturn(0xFF123456.toInt())
        apply(true, requested)
        assertTrue(enabled)
        apply(false, requested)
        assertFalse(enabled)
        apply(true, requested)
        assertTrue(enabled)
        verify(location, times(3)).pulsingMaxRadius = 25f
        verify(location, times(3)).pulsingColor = 0xFF123456.toInt()
    }

    @Test
    fun `default pulse is suppressed while hidden and restored when visible`() {
        val requested: ReadableMap = mock {
            on { hasKey("kind") } doReturn true
            on { getType("kind") } doReturn ReadableType.String
            on { getString("kind") } doReturn "default"
        }
        apply(true, requested)
        assertTrue(enabled)
        apply(false, requested)
        assertFalse(enabled)
        apply(true, requested)
        assertTrue(enabled)
    }

    @Test
    fun `pulse changes while hidden are deferred until visible`() {
        apply(false, request(false))
        apply(false, request(true))
        assertFalse(enabled)
        apply(true, request(true))
        assertTrue(enabled)
    }

    @Test
    fun `explicitly disabled pulse stays disabled after hide show`() {
        val requested = request(false)
        repeat(3) {
            apply(true, requested)
            assertFalse(enabled)
            apply(false, requested)
            assertFalse(enabled)
        }
    }

    @Test
    fun `hiding clears a previously enabled pulse even without a pulse prop`() {
        enabled = true
        apply(false, null)
        assertFalse(enabled)
    }
}
