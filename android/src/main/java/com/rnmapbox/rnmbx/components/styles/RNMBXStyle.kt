package com.rnmapbox.rnmbx.components.styles

import android.content.Context
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.MapboxMap
import com.rnmapbox.rnmbx.components.images.ImageInfo
import com.rnmapbox.rnmbx.utils.ImageEntry
import com.rnmapbox.rnmbx.utils.DownloadMapImageTask
import com.rnmapbox.rnmbx.utils.Logger
import java.util.AbstractMap
import java.util.ArrayList

class RNMBXStyle(private val mContext: Context, reactStyle: ReadableMap?, map: MapboxMap) {
    private val mReactStyle: ReadableMap?
    private val mMap: MapboxMap
    val allStyleKeys: List<String>
        get() {
            if (mReactStyle == null) {
                return ArrayList()
            }
            val it = mReactStyle.keySetIterator()
            val keys: MutableList<String> = ArrayList()
            while (it.hasNextKey()) {
                val key = it.nextKey()
                if (key != "__MAPBOX_STYLESHEET__") {
                    keys.add(key)
                }
            }
            return keys
        }

    fun getStyleValueForKey(styleKey: String): RNMBXStyleValue {
        val styleValueConfig = mReactStyle!!.getMap(styleKey)
        if (styleValueConfig != null) {
            return RNMBXStyleValue(styleValueConfig)
        } else {
            Logger.e("RNMBXStyle", "Value for ${styleKey} not found")
            throw Exception("RNMBXStyle - Value for ${styleKey} not found")
        }
    }

    fun imageEntry(styleValue: RNMBXStyleValue): ImageEntry {
        return ImageEntry(styleValue.imageURI!!, ImageInfo(scale=styleValue.imageScale, name=styleValue.imageURI!!))
    }

    @JvmOverloads
    fun addImage(styleValue: RNMBXStyleValue, styleKey: String, callback: DownloadMapImageTask.OnAllImagesLoaded? = null) {
        if (!styleValue.shouldAddImage()) {
            callback?.onAllImagesLoaded()
            return
        }
        Logger.w(LOG_TAG,"Deprecated: Image in style is deprecated, use images component instead. key: $styleKey [image-in-style-deprecated]")
        val uriStr = styleValue.imageURI!!
        val images = arrayOf<Map.Entry<String, ImageEntry>>(
            AbstractMap.SimpleEntry<String, ImageEntry>(
                uriStr,
                imageEntry(styleValue)
            )
        )
        val task = DownloadMapImageTask(mContext, mMap, null, callback)
        task.execute(images)
    }

    init {
        mReactStyle = reactStyle
        mMap = map
    }

    companion object {
        const val LOG_TAG = "RNMBXStyle"
    }
}