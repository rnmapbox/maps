package com.rnmapbox.rnmbx.components.location

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertSame
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class LocationPuckGuardTest {
    private class FakeComponent(override var canReset: Boolean = true) : LocationPuckGuard.Component {
        val calls = mutableListOf<String>()
        override fun reset() {
            calls += "reset"
        }

        override fun disable() {
            calls += "disable"
        }
    }

    // The Maps SDK's failure when a non-finite puck bearing reaches addPersistentStyleLayer.
    private fun addLayerError() = IllegalArgumentException(
        "Parse error at offset 165: Missing a colon after a name of object member."
    ).apply {
        stackTrace = arrayOf(
            StackTraceElement("com.mapbox.maps.StyleManager", "addPersistentStyleLayer", "StyleManager.java", -2),
        )
    }

    @Test
    fun `leaves the location component alone when the puck applies`() {
        val component = FakeComponent()

        val error = LocationPuckGuard().apply(component) {}

        assertNull(error)
        assertEquals(emptyList<String>(), component.calls)
    }

    @Test
    fun `resets the location component and applies again after the layer cannot be added`() {
        val component = FakeComponent()
        val guard = LocationPuckGuard()
        val failure = addLayerError()
        var applies = 0

        val error = guard.apply(component) {
            applies++
            if (applies == 1) throw failure
        }

        assertSame(failure, error)
        assertEquals(2, applies)
        assertEquals(listOf("disable", "reset"), component.calls)
        assertFalse(guard.disabledAfterError)
    }

    @Test
    fun `leaves the location component disabled when the retry also fails`() {
        val component = FakeComponent()
        val guard = LocationPuckGuard()
        var applies = 0

        val error = guard.apply(component) {
            applies++
            throw addLayerError()
        }

        assertEquals(2, applies)
        assertEquals(1, error?.suppressed?.size)
        assertEquals(listOf("disable", "reset", "disable"), component.calls)
        assertTrue(guard.disabledAfterError)
    }

    @Test
    fun `resets the location component on the next apply`() {
        val component = FakeComponent()
        val guard = LocationPuckGuard()
        guard.apply(component) { throw addLayerError() }
        component.calls.clear()

        val error = guard.apply(component) {}

        assertNull(error)
        assertEquals(listOf("reset"), component.calls)
        assertFalse(guard.disabledAfterError)
    }

    @Test
    fun `disables without a second retry when the next reset fails again`() {
        val component = FakeComponent()
        val guard = LocationPuckGuard()
        guard.apply(component) { throw addLayerError() }
        component.calls.clear()
        var applies = 0

        guard.apply(component) {
            applies++
            throw addLayerError()
        }

        assertEquals(1, applies)
        assertEquals(listOf("reset", "disable"), component.calls)
        assertTrue(guard.disabledAfterError)
    }

    @Test
    fun `does not reset the location component while the map is stopped`() {
        val component = FakeComponent(canReset = false)
        val guard = LocationPuckGuard()
        var applies = 0

        guard.apply(component) {
            applies++
            throw addLayerError()
        }
        guard.apply(component) { applies++ }

        assertEquals(2, applies)
        assertEquals(listOf("disable"), component.calls)
        assertTrue(guard.disabledAfterError)

        component.canReset = true
        guard.apply(component) {}

        assertEquals(listOf("disable", "reset"), component.calls)
        assertFalse(guard.disabledAfterError)
    }

    @Test
    fun `does not catch other IllegalArgumentExceptions`() {
        val component = FakeComponent()

        assertThrows<IllegalArgumentException> {
            LocationPuckGuard().apply(component) { throw IllegalArgumentException("unrelated") }
        }
        assertEquals(emptyList<String>(), component.calls)
    }

    @Test
    fun `does not catch other exceptions`() {
        val component = FakeComponent()

        assertThrows<IllegalStateException> {
            LocationPuckGuard().apply(component) { throw IllegalStateException("unrelated") }
        }
        assertEquals(emptyList<String>(), component.calls)
    }
}

class LocationComponentResetTest {
    private class FakeLocation(var enabled: Boolean = true, var running: Boolean = true) {
        val calls = mutableListOf<String>()
        val reset = LocationComponentReset(
            isRequested = { true },
            isRunning = { running },
            isEnabled = { enabled },
            setEnabled = {
                calls += "enabled=$it"
                enabled = it
            },
            holdProvider = { calls += "hold" },
        )
    }

    @Test
    fun `holds the provider before giving up location on a running map`() {
        val location = FakeLocation()

        location.reset.disable()

        assertEquals(listOf("hold", "enabled=false"), location.calls)
    }

    @Test
    fun `does not hold the provider when location is already off`() {
        val location = FakeLocation(enabled = false)

        location.reset.disable()

        assertEquals(listOf("enabled=false"), location.calls)
    }

    @Test
    fun `does not hold the provider while the map is stopped`() {
        val location = FakeLocation(running = false)

        location.reset.disable()

        assertFalse(location.reset.canReset)
        assertEquals(listOf("enabled=false"), location.calls)
    }

    @Test
    fun `reset hands location over through the provider hold`() {
        val location = FakeLocation()

        location.reset.reset()

        assertEquals(listOf("hold", "enabled=false", "enabled=true"), location.calls)
        assertTrue(location.enabled)
    }

    @Test
    fun `reset of location that is already off enables it without a hold`() {
        val location = FakeLocation(enabled = false)

        location.reset.reset()

        assertEquals(listOf("enabled=false", "enabled=true"), location.calls)
        assertTrue(location.enabled)
    }
}
