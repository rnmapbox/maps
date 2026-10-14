package com.rnmapbox.rnmbx.components.mapview.helpers

import android.view.MotionEvent

internal class LongPressCameraGesture {
    private var touchActive = false
    private var longPressActive = false
    private var cameraOwnsTouch = false

    fun onTouch(action: Int): Boolean {
        if (action == MotionEvent.ACTION_DOWN) {
            touchActive = true
            longPressActive = false
            cameraOwnsTouch = false
        }
        val consume = cameraOwnsTouch
        if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_CANCEL) {
            touchActive = false
            longPressActive = false
            cameraOwnsTouch = false
        }
        return consume
    }

    fun onLongPress() {
        longPressActive = touchActive
    }

    fun takeCameraControl(): Boolean {
        if (!longPressActive || cameraOwnsTouch) return false
        cameraOwnsTouch = true
        return true
    }
}
