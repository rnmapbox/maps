package com.rnmapbox.rnmbx.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.net.Uri
import android.util.Base64
import android.util.Log
import android.util.LruCache
import android.view.View
import com.mapbox.maps.Image
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.OutputStream
import java.net.URL
import java.nio.ByteBuffer

import com.rnmapbox.rnmbx.v11compat.image.*

object BitmapUtils {
    const val LOG_TAG = "BitmapUtils"
    private const val CACHE_SIZE = 1024 * 1024
    private val mCache: LruCache<String?, Bitmap> =
        object : LruCache<String?, Bitmap>(CACHE_SIZE) {
            override fun sizeOf(key: String?, bitmap: Bitmap): Int {
                return bitmap.byteCount
            }
        }

    fun toImage(bitmap: Bitmap): Image {
        if (bitmap.config != Bitmap.Config.ARGB_8888) {
            throw RuntimeException("Only ARGB_8888 bitmap config is supported!")
        }
        val byteBuffer = ByteBuffer.allocate(bitmap.byteCount)
        bitmap.copyPixelsToBuffer(byteBuffer)
        return Image(bitmap.width, bitmap.height, byteBuffer.array().toImageData())
    }

    fun toImage(bitmapDrawable: BitmapDrawable): Image {
        return toImage(bitmapDrawable.bitmap)
    }

    fun getBitmapFromDrawable(sourceDrawable: Drawable?): Bitmap? {
        if (sourceDrawable == null) {
            return null
        }
        return if (sourceDrawable is BitmapDrawable) {
            sourceDrawable.bitmap
        } else {
            //copying drawable object to not manipulate on the same reference
            val constantState = sourceDrawable.constantState ?: return null
            val drawable = constantState.newDrawable().mutate()
            val bitmap = Bitmap.createBitmap(
                drawable.intrinsicWidth, drawable.intrinsicHeight,
                Bitmap.Config.ARGB_8888
            )
            val canvas = Canvas(bitmap)
            drawable.setBounds(0, 0, canvas.width, canvas.height)
            drawable.draw(canvas)
            bitmap
        }
    }


    @Throws(IOException::class)
    fun createImgTempFile(context: Context, image: Image): String? {
        val bitmap = Bitmap.createBitmap(image.width, image.height, Bitmap.Config.ARGB_8888)
        bitmap.copyPixelsFromBuffer(ByteBuffer.wrap(image.data.toByteArray()))
        return createTempFile(context, bitmap)
    }

    fun createTempFile(context: Context, bitmap: Bitmap): String? {
        var tempFile: File? = null
        var outputStream: FileOutputStream? = null
        try {
            tempFile = File.createTempFile(LOG_TAG, ".png", context.cacheDir)
            outputStream = FileOutputStream(tempFile)
        } catch (e: IOException) {
            Log.w(LOG_TAG, e.localizedMessage)
        }
        if (tempFile == null) {
            return null
        }
        if (outputStream == null) {
            return null
        }
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
        closeSnapshotOutputStream(outputStream)
        return Uri.fromFile(tempFile).toString()
    }

    fun createBase64(bitmap: Bitmap): String {
        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
        val bitmapBytes = outputStream.toByteArray()
        closeSnapshotOutputStream(outputStream)
        val base64Prefix = "data:image/png;base64,"
        return base64Prefix + Base64.encodeToString(bitmapBytes, Base64.NO_WRAP)
    }

    fun createImgBase64(image: Image): String {
        val bitmap = Bitmap.createBitmap(image.width, image.height, Bitmap.Config.ARGB_8888)
        bitmap.copyPixelsFromBuffer(ByteBuffer.wrap(image.data.toByteArray()))
        return createBase64(bitmap)
    }

    fun viewToBitmap(v: View?, left: Int, top: Int, right: Int, bottom: Int): Bitmap? {
        var bitmap: Bitmap? = null
        if (v != null) {
            val w = right - left
            val h = bottom - top
            if (w > 0 && h > 0) {
                bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
                bitmap.eraseColor(Color.TRANSPARENT)
                val canvas = Canvas(bitmap)
                v.draw(canvas)
            }
        }
        return bitmap
    }

    private fun addImage(imageURL: String?, bitmap: Bitmap?) {
        mCache.put(imageURL, bitmap)
    }

    private fun getImage(imageURL: String?): Bitmap? {
        return mCache[imageURL]
    }

    private fun closeSnapshotOutputStream(outputStream: OutputStream?) {
        if (outputStream == null) {
            return
        }
        try {
            outputStream.close()
        } catch (e: IOException) {
            Log.w(LOG_TAG, e.localizedMessage)
        }
    }
}