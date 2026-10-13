package com.rnmapbox.rnmbx.components.mapview

/**
 * Holds camera-change notifications until the map's attachment callbacks have
 * applied the initial camera settings.
 */
internal class CameraChangeEventGate(
    private val dispatchCameraChanged: () -> Unit,
) {
    private var isReady = false
    private var hasPendingChange = false

    fun onCameraChanged() {
        if (!isReady) {
            hasPendingChange = true
            return
        }
        dispatchCameraChanged()
    }

    fun markReady() {
        if (isReady) return
        isReady = true
        if (hasPendingChange) {
            hasPendingChange = false
            dispatchCameraChanged()
        }
    }
}
