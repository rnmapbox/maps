package com.rnmapbox.rnmbx.utils

import android.content.Context
import android.graphics.Bitmap
import com.mapbox.maps.Style
import com.mapbox.maps.MapboxMap
import android.os.AsyncTask
import com.rnmapbox.rnmbx.utils.ImageEntry
import android.util.DisplayMetrics
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
import com.rnmapbox.rnmbx.components.images.ImageInfo
import com.rnmapbox.rnmbx.components.images.ImageManager
import java.io.File
import java.lang.ref.WeakReference
import java.util.HashMap
import com.rnmapbox.rnmbx.v11compat.image.*

data class DownloadedImage(val name: String, val bitmap: Bitmap, val info: ImageInfo)

class DownloadMapImageTask(context: Context, map: MapboxMap, imageManager: ImageManager?, callback: OnAllImagesLoaded? = null) :
    AsyncTask<Map.Entry<String, ImageEntry>, Void?, List<DownloadedImage>>() {
    private val mContext: WeakReference<Context>
    private val mMap: WeakReference<MapboxMap>
    private val mCallback: OnAllImagesLoaded?
    private val mCallerContext: Any
    private val mImageManager: WeakReference<ImageManager>

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
                        Log.e("RNMBXImageManager", "downloadImage: $key $uri $image ${image.width}x${image.height}")
                        bitmap.density = DisplayMetrics.DENSITY_DEFAULT
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
                    mImageManager.get()?.resolve(image.name, image.bitmap)
                    style.addBitmapImage(image.name, image.bitmap, info)
                }
            }
        }
        mCallback?.onAllImagesLoaded()
    }

    companion object {
        const val LOG_TAG = "DownloadMapImageTask"
    }

    init {
        mContext = WeakReference(context.applicationContext)
        mMap = WeakReference(map)
        mImageManager = WeakReference(imageManager)
        mCallback = callback
        mCallerContext = this
    }
}