package com.mapbox.rctmgl.utils

import android.content.Context
import android.graphics.Bitmap
import com.mapbox.maps.Style
import com.mapbox.maps.MapboxMap
import com.mapbox.rctmgl.utils.DownloadMapImageTask.OnAllImagesLoaded
import android.os.AsyncTask
import com.mapbox.rctmgl.utils.ImageEntry
import android.util.DisplayMetrics
import com.mapbox.rctmgl.utils.DownloadMapImageTask
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Log
import com.facebook.common.logging.FLog
import com.facebook.common.references.CloseableReference
import com.facebook.datasource.DataSources
import com.facebook.drawee.backends.pipeline.Fresco
import com.facebook.imagepipeline.common.RotationOptions
import com.facebook.imagepipeline.image.CloseableImage
import com.facebook.imagepipeline.image.CloseableStaticBitmap
import com.facebook.imagepipeline.request.ImageRequestBuilder
import com.facebook.react.views.imagehelper.ImageSource
import com.mapbox.rctmgl.components.images.ImageInfo
import com.mapbox.rctmgl.components.images.addBitmapImage
import java.io.File
import java.lang.ref.WeakReference
import java.util.AbstractMap
import java.util.ArrayList
import java.util.HashMap

data class DownloadedImage(val name: String, val bitmap: Bitmap, val info: ImageInfo)

class DownloadMapImageTask(context: Context, map: MapboxMap, callback: OnAllImagesLoaded?) :
    AsyncTask<Map.Entry<String, ImageEntry>, Void?, List<DownloadedImage>>() {
    private val mContext: WeakReference<Context>
    private val mMap: WeakReference<MapboxMap>
    private val mCallback: OnAllImagesLoaded?
    private val mCallerContext: Any

    interface OnAllImagesLoaded {
        fun onAllImagesLoaded()
    }

    @SafeVarargs
    protected override fun doInBackground(vararg objects: Map.Entry<String, ImageEntry>): List<DownloadedImage> {
        val images = mutableListOf<DownloadedImage>()
        val context = mContext.get() ?: return images
        val resources = context.resources
        val metrics = resources.displayMetrics
        for ((key, imageEntry) in objects) {
            var uri = imageEntry.uri
            if (uri.startsWith("/")) {
                uri = Uri.fromFile(File(uri)).toString()
            }
            if (uri.startsWith("http://") || uri.startsWith("https://") ||
                uri.startsWith("file://") || uri.startsWith("asset://") || uri.startsWith("data:")
            ) {
                val source = ImageSource(context, uri)
                val request = ImageRequestBuilder.newBuilderWithSource(source.uri)
                    .setRotationOptions(RotationOptions.autoRotate())
                    .build()
                val dataSource =
                    Fresco.getImagePipeline().fetchDecodedImage(request, mCallerContext)
                var result: CloseableReference<CloseableImage>? = null
                try {
                    result = DataSources.waitForFinalResult(dataSource)
                    if (result != null) {
                        val image = result.get()
                        if (image is CloseableStaticBitmap) {
                            val bitmap =
                                image.underlyingBitmap // Copy the bitmap to make sure it doesn't get recycled when we release
                                    // the fresco reference.
                                    .copy(Bitmap.Config.ARGB_8888, true)
                            bitmap.density =
                                (DisplayMetrics.DENSITY_DEFAULT.toDouble() * imageEntry.getScaleOr(
                                    1.0
                                )).toInt()
                            images.add(
                                DownloadedImage(name=key, bitmap=bitmap, info=imageEntry.info)
                            )
                        } else {
                            FLog.e(LOG_TAG, "Failed to load bitmap from: $uri")
                        }
                    } else {
                        FLog.e(LOG_TAG, "Failed to load bitmap from: $uri")
                    }
                } catch (e: Throwable) {
                    Log.w(LOG_TAG, e.localizedMessage)
                } finally {
                    dataSource.close()
                    if (result != null) {
                        CloseableReference.closeSafely(result)
                    }
                }
            } else {
                // local asset required from JS require('image.png') or import icon from 'image.png' while in release mode
                val bitmap = BitmapUtils.getBitmapFromResource(
                    context,
                    uri,
                    getBitmapOptions(metrics, imageEntry.info.scale)
                )
                if (bitmap != null) {
                    images.add(
                        DownloadedImage(
                            name=key,
                            bitmap=bitmap,
                            info=imageEntry.info
                        )
                    )
                } else {
                    FLog.e(LOG_TAG, "Failed to load bitmap from: $uri")
                }
            }
        }
        return images
    }

    override fun onPostExecute(images: List<DownloadedImage>) {
        val map = mMap.get()
        if (map != null && images != null && images.size > 0) {
            val style = map.getStyle()
            if (style != null) {
                val bitmapImages = HashMap<String, Bitmap>()
                for (image in images) {
                    bitmapImages[image.name] = image.bitmap
                    val info = image.info
                    style.addBitmapImage(image.name, image.bitmap,sdf = info.sdf, stretchX = info.stretchX, stretchY = info.stretchY,
                        content = info.content,scale = info.getScaleOr(1.0)
                    )
                }
            }
        }
        mCallback?.onAllImagesLoaded()
    }

    private fun getBitmapOptions(metrics: DisplayMetrics, scale: Double?): BitmapFactory.Options {
        val options = BitmapFactory.Options()
        options.inScreenDensity = metrics.densityDpi
        options.inTargetDensity = metrics.densityDpi
        if (scale != null) {
            options.inDensity = (DisplayMetrics.DENSITY_DEFAULT.toDouble() * scale).toInt()
        }
        return options
    }

    companion object {
        const val LOG_TAG = "DownloadMapImageTask"
    }

    init {
        mContext = WeakReference(context.applicationContext)
        mMap = WeakReference(map)
        mCallback = callback
        mCallerContext = this
    }
}