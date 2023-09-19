package com.mapbox.rnmbx.components.camera
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.mapbox.geojson.FeatureCollection
import com.mapbox.rnmbx.components.AbstractEventEmitter
import com.mapbox.rnmbx.components.camera.CameraStop.Companion.fromReadableMap
import com.mapbox.rnmbx.utils.GeoJSONUtils.toLatLngBounds


class RNMBXCameraManager(private val mContext: ReactApplicationContext) :
    AbstractEventEmitter<RNMBXCamera?>(
        mContext
    ) {
    override fun customEvents(): Map<String, String>? {
        return HashMap()
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXCamera {
        return RNMBXCamera(reactContext, this)
    }

    @ReactProp(name = "stop")
    fun setStop(camera: RNMBXCamera, map: ReadableMap?) {
        if (map != null) {
            val stop = fromReadableMap(mContext, map, null)
            camera.setStop(stop)
        }
    }

    @ReactProp(name = "defaultStop")
    fun setDefaultStop(camera: RNMBXCamera, map: ReadableMap?) {
        if (map != null) {
            val stop = fromReadableMap(mContext, map, null)
            camera.setDefaultStop(stop)
        }
    }

    @ReactProp(name = "userTrackingMode")
    fun setUserTrackingMode(camera: RNMBXCamera, userTrackingMode: Int) {
        camera.setUserTrackingMode(userTrackingMode)
        throw AssertionError("Unused code")
    }

    @ReactProp(name = "zoomLevel")
    fun setZoomLevel(camera: RNMBXCamera, zoomLevel: Double) {
        camera.setZoomLevel(zoomLevel)
    }

    @ReactProp(name = "minZoomLevel")
    fun setMinZoomLevel(camera: RNMBXCamera, value: Double) {
        camera.setMinZoomLevel(value)
    }

    @ReactProp(name = "maxZoomLevel")
    fun setMaxZoomLevel(camera: RNMBXCamera, value: Double) {
        camera.setMaxZoomLevel(value)
    }

    @ReactProp(name = "followUserLocation")
    fun setFollowUserLocation(camera: RNMBXCamera, value: Boolean) {
        camera.setFollowUserLocation(value)
    }

    @ReactProp(name = "followUserMode")
    fun setFollowUserMode(camera: RNMBXCamera, value: String?) {
        camera.setFollowUserMode(value)
    }

    @ReactProp(name = "followZoomLevel")
    fun setFollowZoomLevel(camera: RNMBXCamera, value: Double) {
        camera.setFollowZoomLevel(value)
    }

    @ReactProp(name = "followPitch")
    fun setFollowPitch(camera: RNMBXCamera, value: Double) {
        camera.setFollowPitch(value)
    }

    @ReactProp(name = "followHeading")
    fun setFollowHeading(camera: RNMBXCamera, value: Double) {
        camera.setFollowHeading(value)
    }

    @ReactProp(name = "followPadding")
    fun setFollowPadding(camera: RNMBXCamera, value: ReadableMap) {
        camera.setFollowPadding(value)
    }

    @ReactProp(name = "maxBounds")
    fun setMaxBounds(camera: RNMBXCamera, value: String?) {
        if (value != null) {
            val collection = FeatureCollection.fromJson(value)
            camera.setMaxBounds(toLatLngBounds(collection))
        } else {
            camera.setMaxBounds(null)
        }
    }

    companion object {
        const val REACT_CLASS = "RNMBXCamera"
    }
}