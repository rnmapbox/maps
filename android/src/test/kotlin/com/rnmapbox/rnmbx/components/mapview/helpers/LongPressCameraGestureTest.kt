package com.rnmapbox.rnmbx.components.mapview.helpers

import android.view.MotionEvent
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class LongPressCameraGestureTest {
    @Test
    fun `camera command during long press consumes remaining touch sequence`() {
        val gesture = LongPressCameraGesture()
        assertFalse(gesture.onTouch(MotionEvent.ACTION_DOWN))
        gesture.onLongPress()
        assertTrue(gesture.takeCameraControl())
        assertFalse(gesture.takeCameraControl())
        assertTrue(gesture.onTouch(MotionEvent.ACTION_MOVE))
        assertTrue(gesture.onTouch(MotionEvent.ACTION_POINTER_DOWN))
        assertTrue(gesture.onTouch(MotionEvent.ACTION_POINTER_UP))
        assertTrue(gesture.onTouch(MotionEvent.ACTION_UP))
        assertFalse(gesture.onTouch(MotionEvent.ACTION_DOWN))
        assertFalse(gesture.onTouch(MotionEvent.ACTION_MOVE))
    }

    @Test
    fun `long press without camera command still pans`() {
        val gesture = LongPressCameraGesture()
        gesture.onTouch(MotionEvent.ACTION_DOWN)
        gesture.onLongPress()
        assertFalse(gesture.onTouch(MotionEvent.ACTION_MOVE))
        assertFalse(gesture.onTouch(MotionEvent.ACTION_UP))
        assertFalse(gesture.takeCameraControl())
    }

    @Test
    fun `ordinary touch and late long press do not cancel gestures`() {
        val gesture = LongPressCameraGesture()
        gesture.onTouch(MotionEvent.ACTION_DOWN)
        assertFalse(gesture.takeCameraControl())
        gesture.onTouch(MotionEvent.ACTION_UP)
        gesture.onLongPress()
        assertFalse(gesture.takeCameraControl())
        gesture.onTouch(MotionEvent.ACTION_DOWN)
        assertFalse(gesture.takeCameraControl())
    }

    @Test
    fun `touch cancellation releases camera control`() {
        val gesture = LongPressCameraGesture()
        gesture.onTouch(MotionEvent.ACTION_DOWN)
        gesture.onLongPress()
        gesture.takeCameraControl()
        assertTrue(gesture.onTouch(MotionEvent.ACTION_CANCEL))
        assertFalse(gesture.takeCameraControl())
        assertFalse(gesture.onTouch(MotionEvent.ACTION_DOWN))
        gesture.onLongPress()
        assertTrue(gesture.takeCameraControl())
    }
}
