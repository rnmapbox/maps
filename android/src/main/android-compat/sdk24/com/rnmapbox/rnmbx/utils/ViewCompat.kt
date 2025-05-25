package com.rnmapbox.rnmbx.utils

import android.os.Build
import android.view.View
import androidx.annotation.RequiresApi
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.setViewTreeLifecycleOwner

/**
 * ViewCompat for SDK 24+ that includes setViewTreeLifecycleOwner support
 */
object ViewCompat {
    @RequiresApi(Build.VERSION_CODES.N)
    fun setViewTreeLifecycleOwner(view: View, lifecycleOwner: LifecycleOwner?) {
        view.setViewTreeLifecycleOwner(lifecycleOwner)
    }
}