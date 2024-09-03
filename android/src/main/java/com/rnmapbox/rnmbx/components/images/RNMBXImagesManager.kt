package com.rnmapbox.rnmbx.components.images

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.view.View
import com.facebook.react.bridge.*
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXImagesManagerInterface
import com.mapbox.maps.ImageContent
import com.mapbox.maps.ImageStretches
import com.rnmapbox.rnmbx.components.AbstractEventEmitter
import com.rnmapbox.rnmbx.events.constants.EventKeys
import com.rnmapbox.rnmbx.events.constants.eventMapOf
import com.rnmapbox.rnmbx.rncompat.dynamic.*
import com.rnmapbox.rnmbx.utils.ImageEntry
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.utils.ResourceUtils
import com.rnmapbox.rnmbx.utils.extensions.forEach
import com.rnmapbox.rnmbx.utils.extensions.getIfDouble
import java.util.*

class RNMBXImagesManager(private val mContext: ReactApplicationContext) :
    AbstractEventEmitter<RNMBXImages>(
        mContext
    ), RNMBXImagesManagerInterface<RNMBXImages> {
    override fun getName(): String {
        return "RNMBXImages"
    }

    public override fun createViewInstance(context: ThemedReactContext): RNMBXImages {
        return RNMBXImages(context, this)
    }

    fun imageInfo(name: String, map: ReadableMap, secondScale: Double? = null): ImageInfo {
        var sdf = false
        var stretchX = listOf<ImageStretches>()
        var stretchY = listOf<ImageStretches>()
        var content : ImageContent? = null
        var scale : Double? = null
        var width : Double? = null
        var height : Double? = null
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
            content = convertContent(map.getDynamic("content"))
        }
        if (map.hasKey("scale")) {
            if (map.getType("scale") != ReadableType.Number) {
                Logger.e("RNMBXImages", "scale should be a number found: $scale in $map")
            }
            scale = map.getDouble("scale") * (secondScale ?: 1.0);
        } else if (secondScale != null) {
            scale = secondScale
        }
        if (map.hasKey("width")) {
            width = map.getDouble("width")
        }
        if (map.hasKey("height")) {
            height = map.getDouble("height")
        }
        return ImageInfo(name=name, sdf=sdf, scale=scale, content=content, stretchX = stretchX, stretchY = stretchY, width = width, height = height)
    }

    @ReactProp(name = "images")
    override fun setImages(images: RNMBXImages, map: Dynamic) {
        val imagesList = mutableListOf<Map.Entry<String, ImageEntry>>()
        map.asMap().forEach { imageName, imageInfo ->
            when (imageInfo) {
                is ReadableMap -> {
                    val uri = imageInfo.getString("uri")
                    if (uri != null) {
                        imagesList.add(
                            AbstractMap.SimpleEntry(
                                imageName,
                                ImageEntry(uri, imageInfo(imageName, imageInfo))
                            )
                        )
                    } else {
                        val imageMap = imageInfo.getMap("resolvedImage")
                        val uri = imageMap?.getString("uri")
                        if (uri != null) {
                            imagesList.add(
                                AbstractMap.SimpleEntry(
                                    imageName,
                                    ImageEntry(
                                        uri,
                                        imageInfo(imageName, imageInfo, imageMap.getIfDouble("scale"))
                                    )
                                )
                            )
                        } else {
                            var url = imageInfo.getString("url")
                            if (url != null) {
                                imagesList.add(
                                    AbstractMap.SimpleEntry(
                                        imageName,
                                        ImageEntry(
                                            url,
                                            imageInfo(imageName, imageInfo)
                                        )
                                    )
                                )

                            } else {
                                Logger.e(
                                    "RNMBXImagesManager",
                                    "Unexpected value for key: $imageName in images property, no uri/url found!"
                                )
                            }
                        }
                    }
                }
                is String -> {
                    val name = imageInfo
                    imagesList.add(AbstractMap.SimpleEntry(imageName, ImageEntry(name, ImageInfo(name=imageName))))
                }
                else -> {
                    Logger.e("RNMBXImagesManager", "Unexpected value for key: $imageName in images property, only string/object is supported")
                }
            }
        }
        images.setImages(imagesList)
    }

    @ReactProp(name = "hasOnImageMissing")
    override fun setHasOnImageMissing(images: RNMBXImages, value: Dynamic) {
        images.setHasOnImageMissing(value.asBoolean())
    }

    private fun convertDrawableToBitmap(sourceDrawable: Drawable?): BitmapDrawable? {
        if (sourceDrawable == null) {
            return null
        }
        return if (sourceDrawable is BitmapDrawable) {
            sourceDrawable
        } else {
            // copying drawable object to not manipulate on the same reference
            val constantState = sourceDrawable.constantState ?: return null
            val drawable = constantState.newDrawable().mutate()
            val bitmap: Bitmap = Bitmap.createBitmap(
                drawable.intrinsicWidth, drawable.intrinsicHeight,
                Bitmap.Config.ARGB_8888
            )
            val canvas = Canvas(bitmap)
            drawable.setBounds(0, 0, canvas.width, canvas.height)
            drawable.draw(canvas)
            BitmapDrawable(mContext.resources, bitmap)
        }
    }

    fun toNativeImage(dynamic: Dynamic): NativeImage? {
        when (dynamic.type) {
            ReadableType.String -> {
                val resourceName = dynamic.asString();
                val drawable =
                    convertDrawableToBitmap(ResourceUtils.getDrawableByName(mContext, resourceName))
                if (drawable != null) {
                    return NativeImage(ImageInfo(name=resourceName), drawable)
                } else {
                    Logger.e("RNMBXImages", "cound not get native drawable with name: $resourceName")
                    return null
                }
            }
            ReadableType.Map -> {
                val map = dynamic.asMap()
                val resourceName = map.getString("name")
                val drawable =
                    convertDrawableToBitmap(ResourceUtils.getDrawableByName(mContext, resourceName))
                if (drawable != null && resourceName != null) {
                    return NativeImage(imageInfo(resourceName, map), drawable)
                } else {
                    Logger.e("RNMBXImages", "cound not get native drawable with name: $resourceName")
                    return null
                }
            }
            else -> {
                Logger.e("RNMBXImages", "nativeImages element should be a string or a object, but was: $dynamic")
                return null
            }
        }
    }

    @ReactProp(name = "nativeImages")
    override fun setNativeImages(images: RNMBXImages, arr: Dynamic) {
        val nativeImages = mutableListOf<NativeImage>();
        for (i in 0 until arr.asArray().size()) {
            val nativeImage = toNativeImage(arr.asArray().getDynamic(i))
            if (nativeImage != null) {
                nativeImages.add(nativeImage)
            }
        }
        images.setNativeImages(nativeImages)
    }

    override fun customEvents(): Map<String, String>? { return eventMapOf(
            EventKeys.IMAGES_MISSING to "onImageMissing"
        )
    }

    // region RNMBXImage children
    override fun addView(parent: RNMBXImages, childView: View, childPosition: Int) {
        if (childView !is RNMBXImage) {
            Logger.e("RNMBXImages", "child view should be RNMBXImage")
            return
        }

        parent.mImageViews.add(childPosition, childView)
        childView.nativeImageUpdater = parent
    }

    override fun removeView(parent: RNMBXImages, view: View) {
        if (parent == null || view == null) {
            Logger.e("RNMBXImages", "removeView: parent or view is null")
            return
        }

        parent.mImageViews.remove(view)
    }

    override fun removeAllViews(parent: RNMBXImages) {
        parent.mImageViews.clear()
    }

    // endregion

    companion object {
        const val REACT_CLASS = "RNMBXImages"

        fun convertStretch(stretch: Dynamic) : List<ImageStretches>? {
            if (stretch.type != ReadableType.Array) {
                Logger.e("RNMBXImages", "stretch should be an array, got $stretch")
                return null
            }
            val array = stretch.asArray()
            var result = mutableListOf<ImageStretches>();
            for (i in 0 until array.size()) {
                if (array.getType(i) != ReadableType.Array) {
                    Logger.e("RNMBXImages", "each element of strech should be an array but was: ${array.getDynamic(i)}")
                } else {
                    val pair = array.getArray(i)
                    if (pair.size() != 2 || pair.getType(0) != ReadableType.Number || pair.getType(1) != ReadableType.Number) {
                        Logger.e("RNMBXImages", "each element of stretch should be pair of 2 integers but was ${pair}")
                    }
                    result.add(ImageStretches(pair.getDouble(0).toFloat(), pair.getDouble(1).toFloat()))
                }
            }
            return result;
        }

        fun convertContent(content: Dynamic) : ImageContent? {
            if (content.type != ReadableType.Array) {
                Logger.e("RNMBXImages", "content should be an array, got $content")
                return null
            }
            val array = content.asArray()
            if (array.size() != 4) {
                Logger.e("RNMBXImages", "content should be an array of 4 numbers, got $content")
                return null
            }
            val result = arrayOf(0.0, 0.0, 0.0, 0.0, 0.0)
            for (i in 0 until array.size()) {
                if (array.getType(i) != ReadableType.Number) {
                    Logger.e("RNMBXImages", "each element of content should be an number but was : ${array}")
                    return null
                } else {
                    result[i] = array.getDouble(i)
                }
            }
            return ImageContent(result[0].toFloat(), result[1].toFloat() ,result[2].toFloat(), result[3].toFloat())
        }
    }
}
