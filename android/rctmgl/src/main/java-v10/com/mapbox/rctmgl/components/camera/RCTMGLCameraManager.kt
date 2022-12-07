package com.mapbox.rctmgl.components.camera

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.mapbox.geojson.FeatureCollection
import com.mapbox.rctmgl.components.AbstractEventEmitter
import com.mapbox.rctmgl.components.camera.CameraStop.Companion.fromReadableMap
import com.mapbox.rctmgl.utils.GeoJSONUtils.toLatLngBounds


//import com.mapbox.rctmgl.utils.GeoJSONUtils;
class RCTMGLCameraManager(private val mContext: ReactApplicationContext) :
    AbstractEventEmitter<RCTMGLCamera?>(
        mContext
    ) {
    override fun customEvents(): Map<String, String>? {
        return HashMap()
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RCTMGLCamera {
        return RCTMGLCamera(reactContext, this)
    }

    @ReactProp(name = "stop")
    fun setStop(camera: RCTMGLCamera, map: ReadableMap?) {
        if (map != null) {
            val stop = fromReadableMap(mContext, map, null)
            camera.setStop(stop)
        }
    }

    @ReactProp(name = "defaultStop")
    fun setDefaultStop(camera: RCTMGLCamera, map: ReadableMap?) {
        if (map != null) {
            val stop = fromReadableMap(mContext, map, null)
            camera.setDefaultStop(stop)
        }
    }

    @ReactProp(name = "userTrackingMode")
    fun setUserTrackingMode(camera: RCTMGLCamera, userTrackingMode: Int) {
        camera.setUserTrackingMode(userTrackingMode)
        throw AssertionError("Unused code")
    }

    @ReactProp(name = "zoomLevel")
    fun setZoomLevel(camera: RCTMGLCamera, zoomLevel: Double) {
        camera.setZoomLevel(zoomLevel)
    }

    @ReactProp(name = "followUserLocation")
    fun setFollowUserLocation(camera: RCTMGLCamera, value: Boolean) {
        camera.setFollowUserLocation(value)
    }

    @ReactProp(name = "followUserMode")
    fun setFollowUserMode(camera: RCTMGLCamera, value: String?) {
        camera.setFollowUserMode(value)
    }

    @ReactProp(name = "minZoomLevel")
    fun setMinZoomLevel(camera: RCTMGLCamera, value: Double) {
        camera.setMinZoomLevel(value)
    }

    @ReactProp(name = "maxZoomLevel")
    fun setMaxZoomLevel(camera: RCTMGLCamera, value: Double) {
        camera.setMaxZoomLevel(value)
    }

    @ReactProp(name = "followPitch")
    fun setFollowPitch(camera: RCTMGLCamera, value: Double) {
        camera.setFollowPitch(value)
    }

    @ReactProp(name = "followHeading")
    fun setFollowHeading(camera: RCTMGLCamera, value: Double) {
        camera.setFollowHeading(value)
    }

    @ReactProp(name = "followZoomLevel")
    fun setFollowZoomLevel(camera: RCTMGLCamera, value: Double) {
        camera.setFollowZoomLevel(value)
    }

    @ReactProp(name = "maxBounds")
    fun setMaxBounds(camera: RCTMGLCamera, value: String?) {
        if (value != null) {
            val collection = FeatureCollection.fromJson(value)
            camera.setMaxBounds(toLatLngBounds(collection))
        } else {
            camera.setMaxBounds(null)
        }
    }

    companion object {
        const val REACT_CLASS = "RCTMGLCamera"
    }
}