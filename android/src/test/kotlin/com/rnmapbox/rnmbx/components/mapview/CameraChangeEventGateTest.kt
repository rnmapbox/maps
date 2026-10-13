package com.rnmapbox.rnmbx.components.mapview

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class CameraChangeEventGateTest {
    @Test
    fun coalescesStartupChangesAndDispatchesOnceWhenReady() {
        var dispatchCount = 0
        val gate = CameraChangeEventGate { dispatchCount++ }

        gate.onCameraChanged()
        gate.onCameraChanged()

        assertEquals(0, dispatchCount)

        gate.markReady()

        assertEquals(1, dispatchCount)
    }

    @Test
    fun dispatchesEachCameraChangeAfterReady() {
        var dispatchCount = 0
        val gate = CameraChangeEventGate { dispatchCount++ }

        gate.markReady()
        gate.onCameraChanged()
        gate.onCameraChanged()

        assertEquals(2, dispatchCount)
    }

    @Test
    fun markingReadyWithoutAStartupChangeDoesNotEmitAnEvent() {
        var dispatchCount = 0
        val gate = CameraChangeEventGate { dispatchCount++ }

        gate.markReady()

        assertEquals(0, dispatchCount)
    }

    @Test
    fun markingReadyMoreThanOnceDoesNotReplayStartupEvents() {
        var dispatchCount = 0
        val gate = CameraChangeEventGate { dispatchCount++ }

        gate.onCameraChanged()
        gate.markReady()
        gate.markReady()

        assertEquals(1, dispatchCount)
    }
}
