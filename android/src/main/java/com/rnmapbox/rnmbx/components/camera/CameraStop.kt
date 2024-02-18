package com.rnmapbox.rnmbx.components.camera

import android.animation.Animator
import android.content.Context
import com.rnmapbox.rnmbx.utils.GeoJSONUtils.toPointGeometry
import com.rnmapbox.rnmbx.utils.GeoJSONUtils.toLatLng
import com.rnmapbox.rnmbx.utils.GeoJSONUtils.toLatLngBounds
import com.rnmapbox.rnmbx.utils.LatLngBounds
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.mapbox.maps.CameraOptions
import com.facebook.react.bridge.ReadableMap
import com.mapbox.geojson.FeatureCollection
import com.mapbox.maps.EdgeInsets
import com.rnmapbox.rnmbx.components.camera.constants.CameraMode
import com.rnmapbox.rnmbx.utils.LatLng

class CameraStop {
    private var mBearing: Double? = null
    private var mTilt: Double? = null
    private var mZoom: Double? = null

    private var mLatLng: LatLng? = null
    private var mBounds: LatLngBounds? = null

    private var mPaddingLeft: Int? = null
    private var mPaddingRight: Int? = null
    private var mPaddingBottom: Int? = null
    private var mPaddingTop: Int? = null

    private var mMode = CameraMode.EASE
    private var mDuration = 2000
    private var mCallback: Animator.AnimatorListener? = null

    fun setBearing(bearing: Double) {
        mBearing = bearing
    }

    fun setTilt(tilt: Double) {
        mTilt = tilt
    }

    fun setZoom(zoom: Double) {
        mZoom = zoom
    }

    fun setLatLng(latLng: LatLng?) {
        mLatLng = latLng
    }

    fun setDuration(duration: Int) {
        mDuration = duration
    }

    fun setCallback(callback: Animator.AnimatorListener?) {
        mCallback = callback
    }

    fun setPadding(
        paddingLeft: Int?,
        paddingRight: Int?,
        paddingTop: Int?,
        paddingBottom: Int?
    ) {
        mPaddingLeft = paddingLeft
        mPaddingRight = paddingRight
        mPaddingTop = paddingTop
        mPaddingBottom = paddingBottom
    }

    fun setBounds(
        bounds: LatLngBounds?,
        paddingLeft: Int?,
        paddingRight: Int?,
        paddingTop: Int?,
        paddingBottom: Int?
    ) {
        mBounds = bounds
        this.setPadding(paddingLeft, paddingRight, paddingTop, paddingBottom)
    }

    fun setMode(@CameraMode.Mode mode: Int) {
        mMode = mode
    }

    private fun convert(value: IntArray): EdgeInsets {
        val left = value[0].toDouble()
        val top = value[1].toDouble()
        val right = value[2].toDouble()
        val bottom = value[3].toDouble()
        return EdgeInsets(
            top, left, bottom, right
        )
    }

    fun toCameraUpdate(mapView: RNMBXMapView): CameraUpdateItem {
        val map = mapView.getMapboxMap()
        val currentCamera = map.cameraState

        val builder = CameraOptions.Builder()
        builder.center(currentCamera.center)
        builder.bearing(currentCamera.bearing)
        builder.padding(currentCamera.padding)
        builder.zoom(currentCamera.zoom)
        if (mBearing != null) {
            builder.bearing(mBearing)
        }
        if (mTilt != null) {
            builder.pitch(mTilt)
        }
        if (mZoom != null) {
            builder.zoom(mZoom)
        }

        val currentPadding = currentCamera.padding
        val paddingLeft: Int = mPaddingLeft ?: currentPadding.left.toInt()
        val paddingTop: Int = mPaddingTop ?: currentPadding.top.toInt()
        val paddingRight: Int = mPaddingRight ?: currentPadding.right.toInt()
        val paddingBottom: Int = mPaddingBottom ?: currentPadding.bottom.toInt()
        val cameraPadding = intArrayOf(paddingLeft, paddingTop, paddingRight, paddingBottom)
        val cameraPaddingClipped = clippedPadding(cameraPadding, mapView)
        val cameraPaddingEdgeInsets = convert(cameraPaddingClipped)
        builder.padding(cameraPaddingEdgeInsets)

        if (mLatLng != null) {
            builder.center(mLatLng!!.point)
        } else if (mBounds != null) {
            val tilt = if (mTilt != null) mTilt!! else currentCamera.pitch
            val bearing = if (mBearing != null) mBearing!! else currentCamera.bearing

            val boundsCamera = map.cameraForCoordinateBounds(
                mBounds!!.toBounds(),
                cameraPaddingEdgeInsets,
                bearing,
                tilt
            )
            builder.center(boundsCamera.center)
            builder.anchor(boundsCamera.anchor)
            builder.zoom(boundsCamera.zoom)
            builder.bearing(boundsCamera.bearing)
            builder.pitch(boundsCamera.pitch)
            builder.padding(boundsCamera.padding)
        }

        return CameraUpdateItem(map, builder.build(), mDuration, mCallback, mMode)
    }

    companion object {
        @JvmStatic
        fun fromReadableMap(
            context: Context,
            readableMap: ReadableMap,
            callback: Animator.AnimatorListener?
        ): CameraStop {
            val stop = CameraStop()

            if (readableMap.hasKey("pitch")) {
                stop.setTilt(readableMap.getDouble("pitch"))
            }

            if (readableMap.hasKey("heading")) {
                stop.setBearing(readableMap.getDouble("heading"))
            }

            if (readableMap.hasKey("centerCoordinate")) {
                val target = toPointGeometry(readableMap.getString("centerCoordinate"))
                stop.setLatLng(toLatLng(target!!))
            }

            if (readableMap.hasKey("zoom")) {
                stop.setZoom(readableMap.getDouble("zoom"))
            }

            if (readableMap.hasKey("duration")) {
                stop.setDuration(readableMap.getInt("duration"))
            }

            val metrics = context.resources.displayMetrics
            val paddingTop = getBoundsPaddingByKey(readableMap, metrics.density, "paddingTop")
            val paddingRight = getBoundsPaddingByKey(readableMap, metrics.density, "paddingRight")
            val paddingBottom = getBoundsPaddingByKey(readableMap, metrics.density, "paddingBottom")
            val paddingLeft = getBoundsPaddingByKey(readableMap, metrics.density, "paddingLeft")

            if (readableMap.hasKey("bounds")) {
                val collection = FeatureCollection.fromJson(readableMap.getString("bounds")!!)
                stop.setBounds(
                    toLatLngBounds(collection), paddingLeft, paddingRight,
                    paddingTop, paddingBottom
                )
            } else {
                stop.setPadding(paddingLeft, paddingRight, paddingTop, paddingBottom)
            }

            if (readableMap.hasKey("mode")) {
                when (readableMap.getInt("mode")) {
                    CameraMode.FLIGHT -> stop.setMode(CameraMode.FLIGHT)
                    CameraMode.LINEAR -> stop.setMode(CameraMode.LINEAR)
                    CameraMode.MOVE -> stop.setMode(CameraMode.MOVE)
                    CameraMode.NONE -> stop.setMode(CameraMode.NONE)
                    else -> stop.setMode(CameraMode.EASE)
                }
            }

            stop.setCallback(callback)

            return stop
        }

        private fun clippedPadding(padding: IntArray, mapView: RNMBXMapView): IntArray {
            val mapHeight = mapView.height
            val mapWidth = mapView.width
            val left = padding[0]
            val top = padding[1]
            val right = padding[2]
            val bottom = padding[3]
            var resultLeft = left
            var resultTop = top
            var resultRight = right
            var resultBottom = bottom
            if (top + bottom >= mapHeight) {
                val totalPadding = (top + bottom).toDouble()
                val extra =
                    totalPadding - mapHeight + 1.0 // add 1 to compensate for floating point math
                resultTop -= (top * extra / totalPadding).toInt()
                resultBottom -= (bottom * extra / totalPadding).toInt()
            }
            if (left + right >= mapWidth) {
                val totalPadding = (left + right).toDouble()
                val extra =
                    totalPadding - mapWidth + 1.0 // add 1 to compensate for floating point math
                resultLeft -= (left * extra / totalPadding).toInt()
                resultRight -= (right * extra / totalPadding).toInt()
            }
            return intArrayOf(resultLeft, resultTop, resultRight, resultBottom)
        }

        private fun getBoundsPaddingByKey(map: ReadableMap, density: Float, key: String): Int? {
            return if (map.hasKey(key)) {
                (map.getInt(key) * density).toInt()
            } else {
                null
            }
        }
    }
}