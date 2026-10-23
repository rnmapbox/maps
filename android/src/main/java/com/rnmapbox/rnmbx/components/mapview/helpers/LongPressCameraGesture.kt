package com.rnmapbox.rnmbx.components.mapview.helpers

internal class LongPressCameraGesture {
    private var longPressTime: Long? = null
    private var suppressedTouch: Long? = null

    fun onLongPress(time: Long) {
        longPressTime = time
    }

    fun onCameraWillMoveMap(): Boolean {
        suppressedTouch = longPressTime
        return suppressedTouch != null
    }

    fun onMove(downTime: Long): Boolean {
        val longPress = suppressedTouch ?: return false
        if (downTime <= longPress) return true
        clear()
        return false
    }

    fun onMoveEnd() {
        clear()
    }

    private fun clear() {
        longPressTime = null
        suppressedTouch = null
    }
}
