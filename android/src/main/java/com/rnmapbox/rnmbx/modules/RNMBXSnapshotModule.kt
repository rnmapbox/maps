package com.rnmapbox.rnmbx.modules

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.mapbox.geojson.Feature
import com.mapbox.geojson.FeatureCollection
import com.mapbox.geojson.Point
import com.mapbox.maps.CameraOptions
import com.mapbox.maps.EdgeInsets
import com.mapbox.maps.MapSnapshotOptions
import com.mapbox.maps.Size
import com.mapbox.maps.SnapshotOverlayOptions
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
            val showLogo = if (jsOptions.hasKey("withLogo")) jsOptions.getBoolean("withLogo") else true
            val overlayOptions = SnapshotOverlayOptions(showLogo = showLogo)
            val snapshotter = Snapshotter(mContext, getOptions(jsOptions), overlayOptions)
            snapshotter.setStyleUri(jsOptions.getString("styleURL")!!)
            try {
                snapshotter.setCamera(getCameraOptions(jsOptions, snapshotter))
            } catch (e: IllegalArgumentException) {
                promise.reject(REACT_CLASS, e.message, e)
                mSnapshotterMap.remove(snapshotterID)
                return@runOnUiQueueThread
            }
            mSnapshotterMap[snapshotterID] = snapshotter

            snapshotter.start(null) { image, error ->
                try {
                    if (image == null) {
                        Log.w(REACT_CLASS, "Snapshot failed: $error")
                        promise.reject(REACT_CLASS, "Snapshot failed: $error")
                        mSnapshotterMap.remove(snapshotterID)
                    } else {
                        val mapboxImage = image.toMapboxImage()
                        var result: String? = null
                        result = if (jsOptions.getBoolean("writeToDisk")) {
                            BitmapUtils.createImgTempFile(mContext, mapboxImage)
                        } else {
                            BitmapUtils.createImgBase64(mapboxImage)
                        }
                        if (result == null) {
                            promise.reject(
                                REACT_CLASS,
                                "Could not generate snapshot, please check Android logs for more info."
                            )
                            return@start
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

    private fun getCameraOptions(jsOptions: ReadableMap, snapshotter: Snapshotter): CameraOptions {
        val pitch = jsOptions.getDouble("pitch")
        val heading = jsOptions.getDouble("heading")
        val zoomLevel = jsOptions.getDouble("zoomLevel")

        // Check if centerCoordinate is provided
        if (jsOptions.hasKey("centerCoordinate") && !jsOptions.isNull("centerCoordinate")) {
            val centerPoint = Feature.fromJson(jsOptions.getString("centerCoordinate")!!)
            val point = centerPoint.geometry() as Point?
            return CameraOptions.Builder()
                .center(point)
                .pitch(pitch)
                .bearing(heading)
                .zoom(zoomLevel)
                .build()
        }

        // Check if bounds is provided
        if (jsOptions.hasKey("bounds") && !jsOptions.isNull("bounds")) {
            val boundsJson = jsOptions.getString("bounds")!!
            val featureCollection = FeatureCollection.fromJson(boundsJson)
            val coords = featureCollection.features()?.mapNotNull { feature ->
                feature.geometry() as? Point
            } ?: emptyList()

            if (coords.isEmpty()) {
                throw IllegalArgumentException("bounds contains no valid coordinates")
            }

            return snapshotter.cameraForCoordinates(
                coords,
                EdgeInsets(0.0, 0.0, 0.0, 0.0),
                heading,
                pitch
            )
        }

        throw IllegalArgumentException("neither centerCoordinate nor bounds provided")
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