package com.rnmapbox.rnmbx.components.annotation

import com.rnmapbox.rnmbx.utils.Logger

/**
 * Writes marker view translations to the table the C++ shadow node reads, see
 * cpp/react/renderer/components/rnmapbox_maps_specs/RNMBXMarkerViewContentTranslations.h
 */
internal object RNMBXMarkerViewContentTranslations {
    private var available = true

    fun set(surfaceId: Int, tag: Int, x: Float, y: Float) {
        if (!available) return
        try {
            nativeSet(surfaceId, tag, x, y)
        } catch (e: UnsatisfiedLinkError) {
            // The natives live in libappmodules.so, linked via react-native.config.js cmakeListsPath.
            available = false
            Logger.e("RNMBXMarkerViewContent", "MarkerView positions won't be reported to measure(): ${e.message}")
        }
    }

    fun remove(surfaceId: Int, tag: Int) {
        if (!available) return
        try {
            nativeRemove(surfaceId, tag)
        } catch (e: UnsatisfiedLinkError) {
            available = false
        }
    }

    @JvmStatic
    private external fun nativeSet(surfaceId: Int, tag: Int, x: Float, y: Float)

    @JvmStatic
    private external fun nativeRemove(surfaceId: Int, tag: Int)
}
