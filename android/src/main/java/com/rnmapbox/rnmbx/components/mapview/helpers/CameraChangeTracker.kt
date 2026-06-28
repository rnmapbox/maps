package com.rnmapbox.rnmbx.components.mapview.helpers

import com.rnmapbox.rnmbx.components.mapview.MapGestureType

enum class CameraChangeReason {
    USER_GESTURE,
    DEVELOPER_ANIMATION,
    SDK_ANIMATION
}

class CameraChangeTracker {
    private val reasonByGesture = mutableMapOf<MapGestureType, CameraChangeReason>()
    var isAnimating = false

    fun setReason(type: MapGestureType, reason: CameraChangeReason) {
        reasonByGesture[type] = reason
    }

    fun clear() {
        reasonByGesture.clear()
    }

    fun clearReason(type: MapGestureType) {
        reasonByGesture.remove(type)
    }

    val isUserInteraction: Boolean
        get() = reasonByGesture.values.any { it == CameraChangeReason.USER_GESTURE }
    val isAnimated: Boolean
        get() = reasonByGesture.values.any { it == CameraChangeReason.DEVELOPER_ANIMATION || it == CameraChangeReason.SDK_ANIMATION }
    val isEmpty: Boolean
        get() = reasonByGesture.isEmpty()
}
