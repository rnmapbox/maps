package com.rnmapbox.rnmbx.modules

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.mapbox.geojson.Feature
import com.mapbox.geojson.Point
import com.mapbox.maps.CameraOptions
import com.mapbox.maps.MapSnapshotOptions
import com.mapbox.maps.Size
import com.mapbox.maps.Snapshotter
import com.rnmapbox.rnmbx.modules.RNMBXModule.Companion.getAccessToken
import com.rnmapbox.rnmbx.modules.RNMBXSnapshotModule
import com.rnmapbox.rnmbx.utils.BitmapUtils
import java.io.IOException
import java.io.OutputStream
import java.util.UUID

import com.rnmapbox.rnmbx.v11compat.snapshot.*

@ReactModule(name = RNMBXSnapshotModule.REACT_CLASS)
class RNMBXSnapshotModule(private val mContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(
        mContext
    ) {
    // prevents snapshotter from being GC'ed
    private val mSnapshotterMap: MutableMap<String, Snapshotter>

    init {
        mSnapshotterMap = HashMap()
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    @ReactMethod
    fun takeSnap(jsOptions: ReadableMap, promise: Promise) {
        // FileSource.getInstance(mContext).activate();
        mContext.runOnUiQueueThread {
            val snapshotterID = UUID.randomUUID().toString()
            val snapshotter = Snapshotter(mContext, getOptions(jsOptions))
            snapshotter.setStyleUri(jsOptions.getString("styleURL")!!)
            snapshotter.setCamera(getCameraOptions(jsOptions))
            mSnapshotterMap[snapshotterID] = snapshotter
            snapshotter.startV11 { image,error ->
                try {
                    if (image == null) {
                        Log.w(REACT_CLASS, "Snapshot failed: $error")
                        promise.reject(REACT_CLASS, "Snapshot failed: $error")
                        mSnapshotterMap.remove(snapshotterID)
                    } else {
                        val image = image.toMapboxImage()
                        var result: String? = null
                        result = if (jsOptions.getBoolean("writeToDisk")) {
                            BitmapUtils.createImgTempFile(mContext, image)
                        } else {
                            BitmapUtils.createImgBase64(image)
                        }
                        if (result == null) {
                            promise.reject(
                                REACT_CLASS,
                                "Could not generate snapshot, please check Android logs for more info."
                            )
                            return@startV11
                        }
                        promise.resolve(result)
                        mSnapshotterMap.remove(snapshotterID)
                    }
                } catch (e: IOException) {
                    e.printStackTrace()
                    promise.reject(REACT_CLASS, e.localizedMessage)
                }
            }
        }
    }

    private fun getCameraOptions(jsOptions: ReadableMap): CameraOptions {
        val centerPoint =
            Feature.fromJson(jsOptions.getString("centerCoordinate")!!)
        val point = centerPoint.geometry() as Point?
        val cameraOptionsBuilder = CameraOptions.Builder()
        return cameraOptionsBuilder
            .center(point)
            .pitch(jsOptions.getDouble("pitch"))
            .bearing(jsOptions.getDouble("heading"))
            .zoom(jsOptions.getDouble("zoomLevel"))
            .build()
    }

    private fun getOptions(jsOptions: ReadableMap): MapSnapshotOptions {
        val builder = MapSnapshotOptions.Builder()
        builder.size(
            Size(
                jsOptions.getDouble("width").toInt().toFloat(),
                jsOptions.getDouble("height").toInt().toFloat()
            )
        )
        builder.pixelRatio(
            java.lang.Float.valueOf(mContext.resources.displayMetrics.density).toInt().toFloat()
        )
        builder.accessToken(getAccessToken(mContext))
        return builder.build()
    }

    private fun closeSnapshotOutputStream(outputStream: OutputStream?) {
        if (outputStream == null) {
            return
        }
        try {
            outputStream.close()
        } catch (e: IOException) {
            Log.w(REACT_CLASS, e.localizedMessage)
        }
    }

    companion object {
        const val REACT_CLASS = "RNMBXSnapshotModule"
    }
}