package com.rnmapbox.rnmbx.components.images

import android.content.Context
import android.graphics.Bitmap
import android.graphics.drawable.BitmapDrawable
import android.util.DisplayMetrics
import android.util.Log
import androidx.core.content.res.ResourcesCompat
import com.mapbox.bindgen.Expected
import com.mapbox.bindgen.None
import com.mapbox.maps.Image
import com.mapbox.maps.ImageContent
import com.mapbox.maps.ImageStretches
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.Style
import com.rnmapbox.rnmbx.R
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.events.ImageMissingEvent
import com.rnmapbox.rnmbx.utils.BitmapUtils
import com.rnmapbox.rnmbx.utils.DownloadMapImageTask
import com.rnmapbox.rnmbx.utils.ImageEntry
import com.rnmapbox.rnmbx.v11compat.image.addStyleImage
import com.rnmapbox.rnmbx.v11compat.image.emptyImage
import com.rnmapbox.rnmbx.v11compat.image.toImageData
import com.rnmapbox.rnmbx.v11compat.image.toMapboxImage
import java.lang.Float.max
import java.nio.ByteBuffer
import java.util.AbstractMap
import kotlin.math.ceil

fun Style.addBitmapImage(imageId: String, bitmap: Bitmap, sdf: Boolean = false, stretchX: List<ImageStretches> = listOf(), stretchY: List<ImageStretches> = listOf(), content: ImageContent? = null, scale: Double = 1.0) : Expected<String, None> {
    val byteBuffer = ByteBuffer.allocate(bitmap.byteCount)
    bitmap.copyPixelsToBuffer(byteBuffer)
    return this.addStyleImage(
        imageId,
        (1.0/((160.0/bitmap.density)) * scale).toFloat() ,
        Image(bitmap.width, bitmap.height, byteBuffer.array().toImageData()),
        sdf,
        stretchX,
        stretchY,
        content,
    )
}

fun Style.addBitmapImage(nativeImage: NativeImage) : Expected<String, None> {
    val info = nativeImage.info
    return addBitmapImage(info.name, nativeImage.drawable.bitmap, info.sdf, info.stretchX, info.stretchY, info.content, info.getScaleOr(1.0))
}

data class ImageInfo(val name: String,  val scale: Double? = 1.0, val sdf: Boolean = false, val stretchX: List<ImageStretches> = listOf(),
                     val stretchY: List<ImageStretches> = listOf(), val content: ImageContent? = null, val width: Double? = null, val height: Double? = null)
{
    fun getScaleOr(default: Double): Double {
        return scale ?: default;
    }
}

data class NativeImage(val info: ImageInfo, val drawable: BitmapDrawable);

interface NativeImageUpdater {
    fun updateImage(imageId: String, bitmap: Bitmap, sdf: Boolean = false, stretchX: List<ImageStretches> = listOf(), stretchY: List<ImageStretches> = listOf(), content: ImageContent? = null, scale: Double = 1.0)
}

class RNMBXImages(context: Context, private val mManager: RNMBXImagesManager) : AbstractMapFeature(context), NativeImageUpdater {
    var mCurrentImages: MutableSet<String?>
    var mImageViews = mutableListOf<RNMBXImage>();
    private var mImages: MutableMap<String, ImageEntry>?
    private var mNativeImages = mutableMapOf<String, NativeImage>()
    private var mSendMissingImageEvents = false
    private var mMap: MapboxMap? = null

    fun setImages(images: List<Map.Entry<String, ImageEntry>>) {
        val newImages: MutableMap<String, ImageEntry> = HashMap()
        for ((key, value) in images) {
            val oldValue = mImages?.put(key, value)
            if (oldValue == null || value.uri != oldValue.uri) {
                newImages[key] = value
            }
        }
        if (mMap != null && mMap?.getStyle() != null) {
            addImagesToStyle(newImages, mMap!!)
        }
    }

    fun setNativeImages(nativeImages: List<NativeImage>) {
        val newImages: MutableMap<String, NativeImage> = HashMap()
        for (nativeImage in nativeImages) {
            val name = nativeImage.info.name
            val oldValue = mNativeImages.put(name, nativeImage)
            if (oldValue == null) {
                newImages[name] = nativeImage
            }
        }
        mMap?.let {
            if (it.getStyle() != null) {
                addNativeImagesToStyle(newImages, it)
            }
        }
    }

    fun setHasOnImageMissing(value: Boolean) {
        mSendMissingImageEvents = value
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        removeImages(mapView)
        mMap = null
        if (reason == RemovalReason.ON_DESTROY) {
            mNativeImages = mutableMapOf()
            mImages = HashMap()
            mCurrentImages = HashSet()
        }
        return super.removeFromMap(mapView, reason)
    }

    private fun removeImages(mapView: RNMBXMapView) {
        mapView.getStyle(object : Style.OnStyleLoaded {
            override fun onStyleLoaded(style: Style) {
                if (hasImages()) {
                    for ((key) in mImages!!) {
                        style.removeStyleImage(key)
                    }
                }
                if (hasNativeImages()) {
                    for ((key) in mNativeImages!!) {
                        style.removeStyleImage(key!!)
                    }
                }
            }
        })
    }

    private fun hasImages(): Boolean {
        return mImages != null && mImages!!.size > 0
    }

    private fun hasNativeImages(): Boolean {
        return mNativeImages != null && mNativeImages!!.size > 0
    }

    fun addMissingImageToStyle(id: String, map: MapboxMap): Boolean {
        val nativeImage = mNativeImages.get(id)
        if (nativeImage != null) {
            addNativeImages(listOf(nativeImage), map)
            return true
        }
        if (mImages != null) {
            val entry = mImages!![id]
            if (entry != null) {
                addRemoteImages(entry(id, entry), map)
                return true
            }
        }
        return false
    }

    fun addImagesToStyle(images: Map<String, ImageEntry>?, map: MapboxMap) {
        if (images != null) {
            addRemoteImages(ArrayList(images.entries), map)
        }
    }

    fun addNativeImagesToStyle(images: Map<String, NativeImage>, map: MapboxMap) {
        addNativeImages(images.values.toList(), map)
    }

    fun sendImageMissingEvent(id: String, map: MapboxMap) {
        if (mSendMissingImageEvents) {
            mManager.handleEvent(ImageMissingEvent.makeImageMissingEvent(this, id))
        }
    }

    private fun hasImage(imageId: String?, map: MapboxMap): Boolean {
        val style = map.getStyle()
        return style != null && imageId?.let { style.getStyleImage(it) } != null
    }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)

        mImageViews.forEach {
            it.addToMap(mapView)
        }
        // Wait for style before adding the source to the map
        // only then we can pre-load required images / placeholders into the style
        // before we add the ShapeSource to the map
        mapView.getStyle(object : Style.OnStyleLoaded {
            override fun onStyleLoaded(style: Style) {
                val map = mapView.getMapboxMap()
                mMap = map
                addNativeImagesToStyle(mNativeImages, map)
                addImagesToStyle(mImages, map)
                // super.addToMap(mapView);

                mImageViews.forEach {
                    it.refresh()
                }
            }
        })
    }

    private fun addNativeImages(imageEntries: List<NativeImage>, map: MapboxMap) {
        val style = map.getStyle()
        if (style == null) return
        for (nativeImage in imageEntries) {
            val name = nativeImage.info.name
            if (!hasImage(name, map)) {
                val bitmap = nativeImage.drawable
                mMapView!!.imageManager.resolve(name, nativeImage.drawable)
                style.addBitmapImage(nativeImage)
                mCurrentImages.add(name)
            }
        }
    }

    private fun placeholderImageFor(info: ImageInfo): Image? {
        if (info.width != null && info.height != null) {
            val width = (info.width * info.getScaleOr(1.0)).toInt()
            val height = (info.width * info.getScaleOr(1.0)).toInt()

            return emptyImage(width, height)
        } else if (info.stretchX.isNotEmpty() || info.stretchY.isNotEmpty() || info.content != null) {
            var maxY = info.stretchY.maxOfOrNull { max(it.first, it.second) } ?: 0.0f
            var maxX = info.stretchX.maxOfOrNull { max(it.first, it.second) } ?: 0.0f
            if (info.content != null) {
                maxX = max(max(info.content.left, info.content.right), maxX)
                maxY = max(max(info.content.top, info.content.bottom), maxY)
            }
            return emptyImage(ceil(maxX).toInt()+1, ceil(maxY).toInt()+1)
        } else {
           return mImagePlaceholder?.toMapboxImage() ?: emptyImage(16, 16)
        }
    }

    private fun addRemoteImages(imageEntries: List<Map.Entry<String, ImageEntry>>?, map: MapboxMap) {
        val style = map.getStyle()
        if (style == null || imageEntries == null) return
        val missingImages: MutableList<Map.Entry<String, ImageEntry>> = ArrayList()

        val metrics = context.resources.displayMetrics
        val screenDensity = (metrics?.density ?: DisplayMetrics.DENSITY_DEFAULT).toDouble()

        // Add image placeholder for images that are not yet available in the style. This way
        // we can load the images asynchronously and add the ShapeSource to the map without delay.
        // The same is required when this ShapeSource is updated with new/added images and the
        // data references them. In which case addMissingImageToStyle will take care of loading
        // them in a similar way.
        //
        // See also: https://github.com/mapbox/mapbox-gl-native/pull/14253#issuecomment-478827792
        for (imageEntry in imageEntries) {
            if (!hasImage(imageEntry.key, map)) {
                val info = imageEntry.value.info;
                val placeholderImage = placeholderImageFor(info)
                placeholderImage?.let {
                    style.addStyleImage(imageEntry.key, it, info)
                }
                mCurrentImages.add(imageEntry.key)
            }
            // make image download even in case the URL changed
            missingImages.add(imageEntry)
        }
        if (missingImages.size > 0) {
            val task = DownloadMapImageTask(context, map, mMapView!!.imageManager)
            val params = missingImages.toTypedArray()
            task.execute(params)
        }
    }

    companion object {
        private var mImagePlaceholder: Bitmap? = null
        fun <K, V> entry(k: K, v: V): List<Map.Entry<K, V>> {
            return listOf(AbstractMap.SimpleEntry(k, v) as Map.Entry<K, V>)
        }
    }

    init {
        mCurrentImages = HashSet()
        mImages = HashMap()
        mNativeImages = HashMap()
        if (mImagePlaceholder == null) {
            mImagePlaceholder = BitmapUtils.getBitmapFromDrawable(ResourcesCompat.getDrawable(context.resources, R.drawable.empty_drawable, null))
        }
    }

    override fun updateImage(imageId: String, bitmap: Bitmap, sdf: Boolean, stretchX: List<ImageStretches>, stretchY: List<ImageStretches>, content: ImageContent?, scale: Double)
    {
        mMap?.getStyle()?.let {
            it.addBitmapImage(imageId, bitmap, sdf, stretchX, stretchY, content, scale);
        }
    }
}