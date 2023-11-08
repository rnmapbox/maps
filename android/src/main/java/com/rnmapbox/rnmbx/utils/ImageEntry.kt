package com.rnmapbox.rnmbx.utils

import com.rnmapbox.rnmbx.components.images.ImageInfo

data class ImageEntry(val uri: String, val info: ImageInfo) {
    fun getScaleOr(v: Double): Double {
        return info.getScaleOr(v)
    }
}
