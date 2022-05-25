package com.mapbox.rctmgl.components.styles

import android.content.Context
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.MapboxMap
import com.mapbox.rctmgl.utils.ImageEntry
import com.mapbox.rctmgl.utils.DownloadMapImageTask
import java.util.AbstractMap
import java.util.ArrayList

class RCTMGLStyle(private val mContext: Context, reactStyle: ReadableMap, map: MapboxMap) {
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

    fun getStyleValueForKey(styleKey: String?): RCTMGLStyleValue? {
        val styleValueConfig = mReactStyle!!.getMap(styleKey!!)
            ?: // TODO: throw exeception here
            return null
        return RCTMGLStyleValue(styleValueConfig)
    }

    fun imageEntry(styleValue: RCTMGLStyleValue): ImageEntry {
        return ImageEntry(styleValue.imageURI, styleValue.imageScale)
    }

    @JvmOverloads
    fun addImage(styleValue: RCTMGLStyleValue, callback: DownloadMapImageTask.OnAllImagesLoaded? = null) {
        if (!styleValue.shouldAddImage()) {
            callback?.onAllImagesLoaded()
            return
        }
        val uriStr = styleValue.imageURI
        val images = arrayOf<Map.Entry<String, ImageEntry>>(
            AbstractMap.SimpleEntry<String, ImageEntry>(
                uriStr,
                imageEntry(styleValue)
            )
        )
        val task = DownloadMapImageTask(mContext, mMap, callback)
        task.execute(*images)
    }

    init {
        mReactStyle = reactStyle
        mMap = map
    }
}