package com.rnmapbox.rnmbx.utils

import android.content.Context
import android.graphics.Bitmap
import com.mapbox.maps.MapboxMap
import android.util.DisplayMetrics
import android.net.Uri
import android.util.Log
import com.facebook.common.references.CloseableReference
import com.facebook.common.util.UriUtil
import com.facebook.datasource.DataSources
import com.facebook.drawee.backends.pipeline.Fresco
import com.facebook.imagepipeline.common.RotationOptions
import com.facebook.imagepipeline.image.CloseableImage
import com.facebook.imagepipeline.image.CloseableStaticBitmap
import com.facebook.imagepipeline.request.ImageRequestBuilder
import com.rnmapbox.rnmbx.components.images.ImageInfo
import com.rnmapbox.rnmbx.components.images.ImageManager
import java.io.File
import java.lang.ref.WeakReference
import com.rnmapbox.rnmbx.v11compat.image.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

data class DownloadedImage(val name: String, val bitmap: Bitmap, val info: ImageInfo)

class DownloadMapImageTask(context: Context, map: MapboxMap, imageManager: ImageManager?, callback: OnAllImagesLoaded? = null) {
    private val mMap: WeakReference<MapboxMap> = WeakReference(map)
    private val mCallback: OnAllImagesLoaded? = callback
    private val mImageManager: WeakReference<ImageManager> = WeakReference(imageManager)
    private val contextRef = WeakReference(context.applicationContext)

    interface OnAllImagesLoaded {
        fun onAllImagesLoaded()
    }

    fun execute(entries: Array<Map.Entry<String, ImageEntry>>) {
        val context = contextRef.get() ?: return
        CoroutineScope(Dispatchers.Main).launch {
            val images = withContext(Dispatchers.IO) {
                downloadImages(entries, context)
            }

            mCallback?.onAllImagesLoaded()
        }
    }

    private suspend fun downloadImages(entries: Array<Map.Entry<String, ImageEntry>>, context: Context): List<DownloadedImage> = coroutineScope {
        entries.asFlow()
                .flatMapMerge(concurrency = entries.size) { entry ->
                    flow { emit(downloadImage(entry.key, entry.value, context)) }
                }
                .filterNotNull()
                .toList()
    }

    private fun downloadImage(key: String, imageEntry: ImageEntry, context: Context): DownloadedImage? {
        var uri = imageEntry.uri
        if (uri.startsWith("/")) {
            uri = Uri.fromFile(File(uri)).toString()
        }
        else if (!uri.startsWith("http://") && !uri.startsWith("https://")){
            var resourceId = context.resources.getIdentifier(uri, "drawable", context.applicationContext.packageName)
            if (resourceId > 0) {
                uri = UriUtil.getUriForResourceId(resourceId).toString()
            }
            else {
                Log.e(LOG_TAG, "Failed to find resource for image: $key ${imageEntry.info.name} ${imageEntry.uri}")
            }
        }
        val request = ImageRequestBuilder.newBuilderWithSource(Uri.parse(uri))
                .setRotationOptions(RotationOptions.autoRotate())
                .build()
        val dataSource = Fresco.getImagePipeline().fetchDecodedImage(request, this)
        var result: CloseableReference<CloseableImage>? = null
        return try {
            result = DataSources.waitForFinalResult(dataSource)
            result?.get()?.let { image ->
                if (image is CloseableStaticBitmap) {
                    val bitmap = image.underlyingBitmap.copy(Bitmap.Config.ARGB_8888, true)
                    bitmap.density = DisplayMetrics.DENSITY_DEFAULT

                    CoroutineScope(Dispatchers.Main).launch {
                        val style = mMap.get()?.getStyle()
                        if (style != null) {
                            mImageManager.get()?.resolve(key, bitmap)
                            style.addBitmapImage(key, bitmap, imageEntry.info)
                        } else {
                            Log.e(LOG_TAG, "Failed to get map style to add bitmap: $uri")
                        }
                    }

                    DownloadedImage(key, bitmap, imageEntry.info)
                } else null
            }
        } catch (e: Throwable) {
            Log.e(LOG_TAG, "Failed to load image: $uri", e)
            null
        } finally {
            dataSource.close()
            result?.let { CloseableReference.closeSafely(it) }
        }
    }

    companion object {
        const val LOG_TAG = "DownloadMapImageTask"
    }
}