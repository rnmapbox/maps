package com.rnmapbox.rnmbx.v11compat.image;

import android.content.Context
import android.graphics.drawable.Drawable
import android.graphics.drawable.VectorDrawable
import androidx.annotation.DrawableRes
import androidx.appcompat.content.res.AppCompatResources

typealias ImageHolder = Drawable;

fun ByteArray.toByteArray(): ByteArray {
    return this
}

fun ByteArray.toImageData() : ByteArray {
    return this
}

fun VectorDrawable.toBitmapImageHolder(): Drawable {
    return this
}

class AppCompatResourcesV11 {
    companion object {
        fun getDrawableImageHolder(context: Context, @DrawableRes resId: Int) : ImageHolder? {
            return AppCompatResources.getDrawable(context, resId)
        }
    }
}
