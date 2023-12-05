package com.rnmapbox.rnmbx.components.location

object UserTrackingMode {
    const val NONE = 0
    const val FOLLOW = 1
    const val FollowWithCourse = 2
    const val FollowWithHeading = 3
    @CameraMode.Mode
    fun getCameraMode(mode: Int): Int {
        when (mode) {
            NONE -> return CameraMode.NONE
            FOLLOW -> return CameraMode.TRACKING
            FollowWithCourse -> return CameraMode.TRACKING_GPS
            FollowWithHeading -> return CameraMode.TRACKING_COMPASS
        }
        return CameraMode.NONE
    }

    fun isUserGesture(reason: Int): Boolean {
        return reason == 1 || reason == 2 // user gesture or animation
    }

    fun toString(value: Int): String? {
        when (value) {
            FOLLOW -> return "normal"
            FollowWithCourse -> return "course"
            FollowWithHeading -> return "compass"
            NONE -> return null
        }
        return null
    }

    fun fromString(value: String?): Int {
        var value = value
        if (value == null) value = ""
        return when (value) {
            "course" -> FollowWithCourse
            "normal" -> FOLLOW
            "compass" -> FollowWithHeading
            else -> FOLLOW
        }
    }
}