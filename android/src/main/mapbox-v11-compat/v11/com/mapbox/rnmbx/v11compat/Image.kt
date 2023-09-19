package com.mapbox.rnmbx.v11compat.image;

import android.content.Context
import android.graphics.drawable.Drawable
import android.graphics.drawable.VectorDrawable
import androidx.annotation.DrawableRes
import androidx.appcompat.content.res.AppCompatResources
import androidx.core.graphics.drawable.toBitmap
import com.mapbox.bindgen.DataRef
import com.mapbox.maps.ImageHolder
import java.nio.ByteBuffer

typealias ImageHolder = com.mapbox.maps.ImageHolder

fun ByteArray.toImageData() : DataRef {
    val nativeDataRef = DataRef.allocateNative(this.size)
    nativeDataRef.buffer.put(this)
    return nativeDataRef
}

fun DataRef.toByteArray(): ByteArray {
    return this.buffer.array()
}
/*
fun Drawable.toImageHolder(drawableId: Int) : ImageHolder {
    return ImageHolder.from(drawableId)
}
*/

fun VectorDrawable.toBitmapImageHolder(): ImageHolder {
    return ImageHolder.from(this.toBitmap())
}

class AppCompatResourcesV11 {
    companion object {
        fun getDrawableImageHolder(context: Context, @DrawableRes resId: Int) : ImageHolder? {
            return ImageHolder.from(resId)
        }
    }
}
