package com.rnmapbox.rnmbx.components.camera
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXCameraManagerInterface
import com.mapbox.geojson.FeatureCollection
import com.rnmapbox.rnmbx.components.AbstractEventEmitter
import com.rnmapbox.rnmbx.components.camera.CameraStop.Companion.fromReadableMap
import com.rnmapbox.rnmbx.utils.GeoJSONUtils.toLatLngBounds


class RNMBXCameraManager(private val mContext: ReactApplicationContext) :
    AbstractEventEmitter<RNMBXCamera?>(
        mContext
    ), RNMBXCameraManagerInterface<RNMBXCamera> {
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
    override fun setStop(camera: RNMBXCamera, map: ReadableMap?) {
        if (map != null) {
            val stop = fromReadableMap(mContext, map, null)
            camera.setStop(stop)
        }
    }

    @ReactProp(name = "defaultStop")
    override fun setDefaultStop(camera: RNMBXCamera, map: ReadableMap?) {
        if (map != null) {
            val stop = fromReadableMap(mContext, map, null)
            camera.setDefaultStop(stop)
        }
    }

    @ReactProp(name = "userTrackingMode")
    override fun setUserTrackingMode(camera: RNMBXCamera, userTrackingMode: Int) {
        camera.setUserTrackingMode(userTrackingMode)
        throw AssertionError("Unused code")
    }

    @ReactProp(name = "zoomLevel")
    override fun setZoomLevel(camera: RNMBXCamera, zoomLevel: Double) {
        camera.setZoomLevel(zoomLevel)
    }

    @ReactProp(name = "minZoomLevel")
    override fun setMinZoomLevel(camera: RNMBXCamera, value: Double) {
        camera.setMinZoomLevel(value)
    }

    @ReactProp(name = "maxZoomLevel")
    override fun setMaxZoomLevel(camera: RNMBXCamera, value: Double) {
        camera.setMaxZoomLevel(value)
    }

    @ReactProp(name = "followUserLocation")
    override fun setFollowUserLocation(camera: RNMBXCamera, value: Boolean) {
        camera.setFollowUserLocation(value)
    }

    @ReactProp(name = "followUserMode")
    override fun setFollowUserMode(camera: RNMBXCamera, value: String?) {
        camera.setFollowUserMode(value)
    }

    @ReactProp(name = "followZoomLevel")
    override fun setFollowZoomLevel(camera: RNMBXCamera, value: Double) {
        camera.setFollowZoomLevel(value)
    }

    @ReactProp(name = "followPitch")
    override fun setFollowPitch(camera: RNMBXCamera, value: Double) {
        camera.setFollowPitch(value)
    }

    @ReactProp(name = "followHeading")
    override fun setFollowHeading(camera: RNMBXCamera, value: Double) {
        camera.setFollowHeading(value)
    }

    @ReactProp(name = "followPadding")
    override fun setFollowPadding(camera: RNMBXCamera, value: Dynamic) {
        camera.setFollowPadding(value.asMap())
    }

    @ReactProp(name = "maxBounds")
    override fun setMaxBounds(camera: RNMBXCamera, value: String?) {
        if (value != null) {
            val collection = FeatureCollection.fromJson(value)
            camera.setMaxBounds(toLatLngBounds(collection))
        } else {
            camera.setMaxBounds(null)
        }
    }

    override fun setAnimationDuration(view: RNMBXCamera?, value: Double) {
        // no-op on Android
    }

    override fun setAnimationMode(view: RNMBXCamera?, value: String?) {
        // no-op on Android
    }

    companion object {
        const val REACT_CLASS = "RNMBXCamera"
    }
}