package com.rnmapbox.rnmbx.utils

import android.view.View
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ViewTreeLifecycleOwner

/**
 * ViewCompat for SDK 21+ that uses the older ViewTreeLifecycleOwner.set() API
 */
object ViewCompat {
    fun setViewTreeLifecycleOwner(view: View, lifecycleOwner: LifecycleOwner?) {
        // Use the older API that's available in earlier SDK versions
        ViewTreeLifecycleOwner.set(view, lifecycleOwner)
    }
}