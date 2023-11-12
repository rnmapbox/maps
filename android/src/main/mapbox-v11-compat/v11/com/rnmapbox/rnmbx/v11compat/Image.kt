package com.rnmapbox.rnmbx.v11compat.image;

import android.content.Context
import android.content.res.Resources
import android.graphics.Bitmap
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.graphics.drawable.VectorDrawable
import androidx.annotation.DrawableRes
import androidx.core.graphics.drawable.toBitmap
import com.mapbox.bindgen.DataRef
import com.mapbox.maps.Image
import com.mapbox.maps.ImageHolder
import com.mapbox.maps.Style
import com.mapbox.maps.toMapboxImage
import com.rnmapbox.rnmbx.components.images.ImageInfo
import java.nio.ByteBuffer
import com.mapbox.maps.toMapboxImage as _toMapboxImage

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

fun BitmapDrawable.toBitmapImageHolder(): ImageHolder {
    return ImageHolder.from(this.toBitmap())
}

class AppCompatResourcesV11 {
    companion object {
        fun getDrawableImageHolder(context: Context, @DrawableRes resId: Int) : ImageHolder? {
            return ImageHolder.from(resId)
        }
    }
}

fun Bitmap.toMapboxImage(): Image {
    return this._toMapboxImage()
}

fun Style.addStyleImage(imageId: String, image: Image, info: ImageInfo, scale: Double = 1.0) {
    addStyleImage(imageId, (info.getScaleOr(1.0) * scale).toFloat(), image, info.sdf, info.stretchX, info.stretchY, info.content)
}

fun Style.addBitmapImage(imageId: String, bitmap: Bitmap, info: ImageInfo) {
    return this.addStyleImage(
        imageId,
        bitmap.toMapboxImage(),
        info,
    )
}

fun emptyImage(width: Int, height: Int): Image {
    return Image(
        width, height, DataRef.allocateNative(width * height * 4)
    )
}

fun Image.toDrawable(): Drawable {
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    bitmap.copyPixelsFromBuffer(data.buffer)

    return BitmapDrawable(Resources.getSystem(), bitmap)
}

fun Image.toImageHolder(): ImageHolder {
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    bitmap.copyPixelsFromBuffer(data.buffer)

    return ImageHolder.from(bitmap)
}

