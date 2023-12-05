package com.rnmapbox.rnmbx.v11compat.image;

import android.content.Context
import android.content.res.Resources
import android.graphics.Bitmap
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.graphics.drawable.VectorDrawable
import androidx.annotation.DrawableRes
import androidx.appcompat.content.res.AppCompatResources
import com.mapbox.maps.Image
import com.mapbox.maps.Style
import com.rnmapbox.rnmbx.components.images.ImageInfo
import java.nio.ByteBuffer

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

fun BitmapDrawable.toBitmapImageHolder(): ImageHolder {
    return this
}

fun emptyImage(width: Int, height: Int): Image {
    return Image(width, height, ByteArray(width * height * 4) /* ByteBuffer.allocateDirect(width * height * 4).array()*/)
}

fun Bitmap.toMapboxImage(): Image {
    val byteBuffer = ByteBuffer.allocate(byteCount)
    copyPixelsToBuffer(byteBuffer)
    return Image(width, height, byteBuffer.array())
}

fun Style.addStyleImage(imageId: String, image: Image, info: ImageInfo, scale: Double = 1.0) {
    addStyleImage(imageId, (info.getScaleOr(1.0) * scale).toFloat(), image, info.sdf, info.stretchX, info.stretchY, info.content)
}

fun Style.addBitmapImage(imageId: String, bitmap: Bitmap, info: ImageInfo, scale: Double = 1.0) {
    addStyleImage(imageId, bitmap.toMapboxImage(), info, scale)
}

class AppCompatResourcesV11 {
    companion object {
        fun getDrawableImageHolder(context: Context, @DrawableRes resId: Int) : ImageHolder? {
            return AppCompatResources.getDrawable(context, resId)
        }
    }
}

fun Image.toDrawable(): Drawable {
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    bitmap.copyPixelsFromBuffer(ByteBuffer.wrap(data))

    return BitmapDrawable(Resources.getSystem(), bitmap)
}

fun Image.toImageHolder(): ImageHolder {
    return toDrawable()
}
