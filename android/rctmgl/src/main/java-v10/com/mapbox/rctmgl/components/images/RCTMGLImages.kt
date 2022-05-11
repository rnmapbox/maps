package com.mapbox.rctmgl.components.images

import android.content.Context
import android.graphics.Bitmap
import com.mapbox.rctmgl.components.images.RCTMGLImagesManager
import com.mapbox.rctmgl.components.AbstractMapFeature
import com.mapbox.rctmgl.utils.ImageEntry
import android.graphics.drawable.BitmapDrawable
import androidx.core.content.res.ResourcesCompat
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.Style
import com.mapbox.rctmgl.R
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.images.RCTMGLImages
import com.mapbox.rctmgl.events.ImageMissingEvent
import com.mapbox.rctmgl.utils.BitmapUtils
import com.mapbox.rctmgl.utils.DownloadMapImageTask
import java.util.AbstractMap
import java.util.ArrayList
import java.util.HashMap
import java.util.HashSet

class RCTMGLImages(context: Context, private val mManager: RCTMGLImagesManager) : AbstractMapFeature(context) {
    var mCurrentImages: MutableSet<String?>
    private var mImages: MutableMap<String, ImageEntry>?
    private var mNativeImages: MutableMap<String?, BitmapDrawable?>?
    private var mSendMissingImageEvents = false
    private var mMap: MapboxMap? = null
    var iD: String? = null
    fun setImages(images: List<Map.Entry<String, ImageEntry>>) {
        val newImages: MutableMap<String, ImageEntry> = HashMap()
        for ((key, value) in images) {
            val oldValue = mImages?.put(key, value)
            if (oldValue == null) {
                newImages[key] = value
            }
        }
        if (mMap != null && mMap?.getStyle() != null) {
            addImagesToStyle(newImages, mMap!!)
        }
    }

    fun setNativeImages(nativeImages: List<Map.Entry<String, BitmapDrawable>>) {
        val newImages: MutableMap<String?, BitmapDrawable?> = HashMap()
        for ((key, value) in nativeImages) {
            val oldValue = mNativeImages?.put(key, value)
            if (oldValue == null) {
                newImages[key] = value
            }
        }
        if (mMap != null && mMap?.getStyle() != null) {
            addNativeImagesToStyle(newImages, mMap!!)
        }
    }

    fun setHasOnImageMissing(value: Boolean) {
        mSendMissingImageEvents = value
    }

    override fun removeFromMap(mapView: RCTMGLMapView) {
        removeImages(mapView)
        mMap = null
        mNativeImages = HashMap()
        mImages = HashMap()
        mCurrentImages = HashSet()
    }

    private fun removeImages(mapView: RCTMGLMapView) {
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
        if (mNativeImages != null) {
            val drawable = mNativeImages!![id]
            if (drawable != null) {
                addNativeImages(entry<String?, BitmapDrawable?>(id, drawable), map)
                return true
            }
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

    fun addNativeImagesToStyle(images: Map<String?, BitmapDrawable?>?, map: MapboxMap) {
        if (images != null) {
            addNativeImages(ArrayList(images.entries), map)
        }
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

    override fun addToMap(mapView: RCTMGLMapView) {
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
            }
        })
    }

    private fun addNativeImages(imageEntries: List<Map.Entry<String?, BitmapDrawable?>>?, map: MapboxMap) {
        val style = map.getStyle()
        if (style == null || imageEntries == null) return
        for ((key, value) in imageEntries) {
            if (key != null && !hasImage(key, map)) {
                style.addImage(key, BitmapUtils.toImage(value))
                mCurrentImages.add(key)
            }
        }
    }

    private fun addRemoteImages(imageEntries: List<Map.Entry<String, ImageEntry>>?, map: MapboxMap) {
        val style = map.getStyle()
        if (style == null || imageEntries == null) return
        val missingImages: MutableList<Map.Entry<String, ImageEntry>> = ArrayList()

        // Add image placeholder for images that are not yet available in the style. This way
        // we can load the images asynchronously and add the ShapeSource to the map without delay.
        // The same is required when this ShapeSource is updated with new/added images and the
        // data references them. In which case addMissingImageToStyle will take care of loading
        // them in a similar way.
        //
        // See also: https://github.com/mapbox/mapbox-gl-native/pull/14253#issuecomment-478827792
        for (imageEntry in imageEntries) {
            if (!hasImage(imageEntry.key, map)) {
                mImagePlaceholder?.let { style.addImage(imageEntry.key, it) }
                missingImages.add(imageEntry)
                mCurrentImages.add(imageEntry.key)
            }
        }
        if (missingImages.size > 0) {
            val task = DownloadMapImageTask(context, map, null)
            val params = missingImages.toTypedArray()
            for (param in params) {
                task.execute(param)
            }


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
}