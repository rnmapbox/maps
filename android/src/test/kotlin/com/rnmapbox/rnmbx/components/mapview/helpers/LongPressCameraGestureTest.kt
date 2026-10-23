package com.rnmapbox.rnmbx.components.mapview.helpers

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class LongPressCameraGestureTest {
    @Test
    fun `only camera moves from the held long press suppress that touch`() {
        val gesture = LongPressCameraGesture()
        assertFalse(gesture.onMove(100))
        gesture.onLongPress(200)
        assertFalse(gesture.onMove(100))
        assertTrue(gesture.onCameraWillMoveMap())
        assertTrue(gesture.onMove(100))
        gesture.onMoveEnd()
        assertFalse(gesture.onMove(100))

        gesture.onLongPress(400)
        assertTrue(gesture.onCameraWillMoveMap())
        assertFalse(gesture.onMove(500)) // A new touch after release.
        assertFalse(gesture.onMove(100))
    }
}
