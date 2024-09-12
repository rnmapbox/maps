package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import android.net.Uri
import android.util.Log
import com.facebook.react.views.imagehelper.ResourceDrawableIdHelper
import com.mapbox.maps.extension.style.sources.generated.ImageSource
import com.rnmapbox.rnmbx.utils.LatLngQuad
import java.net.URL

class RNMBXImageSource(context: Context?) : RNMBXSource<ImageSource?>(context) {
    private var mURL: URL? = null
    private var mResourceId = 0
    private var mCoordQuad: LatLngQuad? = null

    override fun hasNoDataSoRefersToExisting(): Boolean {
        return mURL == null
    }

    override fun makeSource(): ImageSource? {
        if (mURL == null) {
            throw RuntimeException("ImageSource without URL not supported in v10, resourceId is not supported")
        }
        val id = iD;
        if (id == null) {
            throw RuntimeException("ImageSource without ID not supported in v10")
        }
        return ImageSource.Builder(id).coordinates(mCoordQuad!!.coordinates).url(mURL.toString()).build()
    }

    override fun onPress(feature: OnPressEvent?) {
        // ignore, we cannot query raster layers
    }

    fun setURL(url: String?) {
        try {
            val uri = Uri.parse(url)
            if (uri.scheme == null) {
                mResourceId =
                    ResourceDrawableIdHelper.getInstance().getResourceDrawableId(this.context, url)
                if (mSource != null) {
                    throw RuntimeException("ImageSource Resource id not supported in v10")
                }
            } else {
                mURL = URL(url)
                if (mSource != null) {
                    mSource!!.url(mURL.toString())
                }
            }
        } catch (e: Exception) {
            Log.w(LOG_TAG, e.localizedMessage)
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

