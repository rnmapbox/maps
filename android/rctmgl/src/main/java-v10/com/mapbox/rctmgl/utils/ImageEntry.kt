package com.mapbox.rctmgl.utils

import com.mapbox.rctmgl.components.images.ImageInfo

data class ImageEntry(val uri: String, val info: ImageInfo) {
    fun getScaleOr(v: Double): Double {
        return if (info.scale == defaultScale) {
            v
        } else {
            info.scale
        }
    }

    companion object {
        const val defaultScale = 0.0
    }
}
