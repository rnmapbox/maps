package com.mapbox.rctmgl.components.images

import android.graphics.drawable.BitmapDrawable
import android.view.View
import com.facebook.react.bridge.*
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.mapbox.maps.ImageContent
import com.mapbox.maps.ImageStretches
import com.mapbox.rctmgl.components.AbstractEventEmitter
import com.mapbox.rctmgl.events.constants.EventKeys
import com.mapbox.rctmgl.utils.ImageEntry
import com.mapbox.rctmgl.utils.Logger
import com.mapbox.rctmgl.utils.ResourceUtils
import com.mapbox.rctmgl.utils.extensions.forEach
import java.util.*

class RCTMGLImagesManager(private val mContext: ReactApplicationContext) :
    AbstractEventEmitter<RCTMGLImages?>(
        mContext
    ) {
    override fun getName(): String {
        return "RCTMGLImages"
    }

    public override fun createViewInstance(context: ThemedReactContext): RCTMGLImages {
        return RCTMGLImages(context, this)
    }

    fun imageInfo(name: String, map: ReadableMap): ImageInfo {
        var sdf = false
        var stretchX = listOf<ImageStretches>()
        var stretchY = listOf<ImageStretches>()
        var content : ImageContent? = null
        var scale : Double? = null
        if (map.hasKey("sdf")) {
            sdf = map.getBoolean("sdf");
        }
        if (map.hasKey("stretchX")) {
            stretchX = convertStretch(map.getDynamic("stretchX")) ?: listOf()
        }
        if (map.hasKey("stretchY")) {
            stretchY = convertStretch(map.getDynamic("stretchY")) ?: listOf()
        }
        if (map.hasKey("content")) {
            content = convertContent(map.getDynamic("content")) ?: null
        }
        if (map.hasKey("scale")) {
            if (map.getType("scale") != ReadableType.Number) {
                Logger.e("RCTMGLImages", "scale should be a number found: $scale in $map")
            }
            scale = map.getDouble("scale")
        }
        return ImageInfo(name=name, sdf=sdf, scale=scale, content=content, stretchX = stretchX, stretchY = stretchY)
    }

    @ReactProp(name = "images")
    fun setImages(images: RCTMGLImages, map: ReadableMap) {
        val imagesList = mutableListOf<Map.Entry<String, ImageEntry>>()
        map.forEach { imageName, imageInfo ->
            when (imageInfo) {
                is ReadableMap -> {
                    val uri = imageInfo.getString("uri") ?: imageInfo.getString("url")
                    if (uri != null) {
                        imagesList.add(AbstractMap.SimpleEntry(imageName, ImageEntry(uri,  imageInfo(imageName, imageInfo))))
                    } else {
                        Logger.e("RCTMGLImagesManager", "Unexpected value for key: $imageName in images property, no uri/url found!")
                    }
                }
                is String -> {
                    val name = imageInfo
                    imagesList.add(AbstractMap.SimpleEntry(imageName, ImageEntry(name, ImageInfo(name=imageName))))
                }
                else -> {
                    Logger.e("RCTMGLImagesManager", "Unexpected value for key: $imageName in images property, only string/object is supported")
                }
            }
        }
        images.setImages(imagesList)
    }

    @ReactProp(name = "hasOnImageMissing")
    fun setHasOnImageMissing(images: RCTMGLImages, value: Boolean?) {
        images.setHasOnImageMissing(value!!)
    }

    fun toNativeImage(dynamic: Dynamic): NativeImage? {
        when (dynamic.type) {
            ReadableType.String -> {
                val resourceName = dynamic.asString();
                val drawable =
                    ResourceUtils.getDrawableByName(mContext, resourceName) as BitmapDrawable?
                if (drawable != null) {
                    return NativeImage(ImageInfo(name=resourceName), drawable)
                } else {
                    Logger.e("RCTMGLImages", "cound not get native drawable with name: $resourceName")
                    return null
                }
            }
            ReadableType.Map -> {
                val map = dynamic.asMap()
                val resourceName = map.getString("name")
                val drawable =
                    ResourceUtils.getDrawableByName(mContext, resourceName) as BitmapDrawable?
                if (drawable != null && resourceName != null) {
                    return NativeImage(imageInfo(resourceName, map), drawable)
                } else {
                    Logger.e("RCTMGLImages", "cound not get native drawable with name: $resourceName")
                    return null
                }
            }
            else -> {
                Logger.e("RCTMGLImages", "nativeImages element should be a string or a object, but was: $dynamic")
                return null
            }
        }
    }

    @ReactProp(name = "nativeImages")
    fun setNativeImages(images: RCTMGLImages, arr: ReadableArray) {
        val nativeImages = mutableListOf<NativeImage>();
        for (i in 0 until arr.size()) {
            val nativeImage = toNativeImage(arr.getDynamic(i))
            if (nativeImage != null) {
                nativeImages.add(nativeImage)
            }
        }
        images.setNativeImages(nativeImages)
    }

    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .put(EventKeys.IMAGES_MISSING, "onImageMissing")
            .build()
    }

    // region RCTMGLImage children

    override fun addView(parent: RCTMGLImages?, childView: View?, childPosition: Int) {
        if (parent == null || childView == null) {
            Logger.e("RCTMGLImages", "addView: parent or childView is null")
            return
        }

        if (childView !is RCTMGLImage) {
            Logger.e("RCTMGLImages", "child view should be RCTMGLImage")
            return
        }

        parent.mImageViews.add(childPosition, childView)
        childView.nativeImageUpdater = parent
    }

    override fun removeView(parent: RCTMGLImages?, view: View?) {
        if (parent == null || view == null) {
            Logger.e("RCTMGLImages", "removeView: parent or view is null")
            return
        }

        parent.mImageViews.remove(view)
    }

    override fun removeAllViews(parent: RCTMGLImages?) {
        if (parent == null) {
            Logger.e("RCTMGLImages", "removeAllViews parent is null")
            return
        }

        parent.mImageViews.clear()
    }

    // endregion

    companion object {
        const val REACT_CLASS = "RCTMGLImages"

        fun convertStretch(stretch: Dynamic) : List<ImageStretches>? {
            if (stretch.type != ReadableType.Array) {
                Logger.e("RCTMGLImages", "stretch should be an array, got $stretch")
                return null
            }
            val array = stretch.asArray()
            var result = mutableListOf<ImageStretches>();
            for (i in 0 until array.size()) {
                if (array.getType(i) != ReadableType.Array) {
                    Logger.e("RTMGLImages", "each element of strech should be an array but was: ${array.getDynamic(i)}")
                } else {
                    val pair = array.getArray(i)
                    if (pair.size() != 2 || pair.getType(0) != ReadableType.Number || pair.getType(1) != ReadableType.Number) {
                        Logger.e("RCTMGLImages", "each element of stretch should be pair of 2 integers but was ${pair}")
                    }
                    result.add(ImageStretches(pair.getDouble(0).toFloat(), pair.getDouble(1).toFloat()))
                }
            }
            return result;
        }

        fun convertContent(content: Dynamic) : ImageContent? {
            if (content.type != ReadableType.Array) {
                Logger.e("RCTMGLImages", "content should be an array, got $content")
                return null
            }
            val array = content.asArray()
            if (array.size() != 4) {
                Logger.e("RCTMGLImages", "content should be an array of 4 numbers, got $content")
                return null
            }
            val result = arrayOf(0.0, 0.0, 0.0, 0.0, 0.0)
            for (i in 0 until array.size()) {
                if (array.getType(i) != ReadableType.Number) {
                    Logger.e("RTMGLImages", "each element of content should be an number but was : ${array}")
                    return null
                } else {
                    result[i] = array.getDouble(i)
                }
            }
            return ImageContent(result[0].toFloat(), result[1].toFloat() ,result[2].toFloat(), result[3].toFloat())
        }
    }
}