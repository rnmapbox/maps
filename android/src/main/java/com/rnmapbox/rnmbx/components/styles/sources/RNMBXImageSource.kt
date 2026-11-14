package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Log
import com.facebook.react.views.imagehelper.ResourceDrawableIdHelper
import com.mapbox.maps.Style
import com.mapbox.maps.extension.style.sources.generated.ImageSource
import com.mapbox.maps.extension.style.sources.updateImage
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.utils.LatLngQuad
import com.rnmapbox.rnmbx.utils.Logger
import java.net.URL

class RNMBXImageSource(context: Context?) : RNMBXSource<ImageSource?>(context) {
    private var mURL: URL? = null
    // Release builds bundle require()'d images as drawable resources rather than serving them from a URL.
    private var mBitmap: Bitmap? = null
    private var mCoordQuad: LatLngQuad? = null

    override fun hasNoDataSoRefersToExisting(): Boolean {
        return mURL == null && mBitmap == null
    }

    override fun makeSource(): ImageSource? {
        val id = iD ?: throw RuntimeException("ImageSource without ID is not supported")
        val builder = ImageSource.Builder(id).coordinates(mCoordQuad!!.coordinates)
        mURL?.let { builder.url(it.toString()) }
        return builder.build()
    }

    override fun addToMap(existings: Boolean, style: Style, mapView: RNMBXMapView) {
        super.addToMap(existings, style, mapView)
        // updateImage only works once the source is part of the style.
        mBitmap?.let { mSource?.updateImage(it) }
    }

    override fun onPress(feature: OnPressEvent?) {
        // ignore, we cannot query raster layers
    }

    fun setURL(url: String?) {
        try {
            val uri = Uri.parse(url)
            if (uri.scheme == null) {
                val resourceId =
                    ResourceDrawableIdHelper.getInstance().getResourceDrawableId(this.context, url)
                val bitmap = BitmapFactory.decodeResource(context.resources, resourceId)
                if (bitmap == null) {
                    Logger.w(LOG_TAG, "Could not decode image resource: $url")
                    return
                }
                mURL = null
                mBitmap = bitmap
                mSource?.updateImage(bitmap)
            } else {
                mBitmap = null
                mURL = URL(url)
                mSource?.url(mURL.toString())
            }
        } catch (e: Exception) {
            Logger.w(LOG_TAG, "Failed to set ImageSource url: $url", e)
        }
    }

    fun setCoordinates(coordQuad: LatLngQuad?) {
        mCoordQuad = coordQuad
        try {
            if (mSource != null) {
                mSource!!.coordinates(mCoordQuad!!.coordinates)
            }
        } catch (e: Exception) {
            Log.w(LOG_TAG, e.localizedMessage)
        }
    }

    companion object {
        const val LOG_TAG = "RNMBXImageSource"
    }
}

