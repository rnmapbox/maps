package com.mapbox.rctmgl.utils

import com.mapbox.rctmgl.components.images.ImageInfo

data class ImageEntry(val uri: String, val info: ImageInfo) {
    fun getScaleOr(v: Double): Double {
        return info.getScaleOr(v)
    }
}
