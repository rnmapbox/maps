package com.rnmapbox.rnmbx.components.mapview.helpers

enum class CameraChangeReason {
    NONE,
    USER_GESTURE,
    DEVELOPER_ANIMATION,
    SDK_ANIMATION
}

class CameraChangeTracker {
    private var reason : CameraChangeReason = CameraChangeReason.NONE
    var isAnimating = false
    fun setReason(reason: CameraChangeReason) {
        this.reason = reason
    }

    val isUserInteraction: Boolean
        get() = reason == CameraChangeReason.USER_GESTURE || reason == CameraChangeReason.DEVELOPER_ANIMATION
    val isAnimated: Boolean
        get() = reason == CameraChangeReason.DEVELOPER_ANIMATION || reason == CameraChangeReason.SDK_ANIMATION
    val isEmpty: Boolean
        get() = reason == CameraChangeReason.NONE
}