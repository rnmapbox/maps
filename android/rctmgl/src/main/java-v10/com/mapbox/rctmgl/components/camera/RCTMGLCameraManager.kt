package com.mapbox.rctmgl.components.camera

import com.mapbox.rctmgl.components.camera.CameraStop.Companion.fromReadableMap
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.CameraOptions
import com.mapbox.maps.plugin.animation.CameraAnimationsPlugin
import android.view.animation.LinearInterpolator
import android.view.animation.AccelerateDecelerateInterpolator
import com.mapbox.rctmgl.components.camera.CameraStop
import com.mapbox.rctmgl.components.camera.CameraUpdateQueue.OnCompleteAllListener
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.camera.CameraUpdateItem
import com.facebook.react.bridge.ReactApplicationContext
import com.mapbox.rctmgl.components.AbstractEventEmitter
import com.mapbox.rctmgl.components.camera.RCTMGLCamera
import com.mapbox.rctmgl.components.camera.RCTMGLCameraManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.ReadableMap
import java.lang.AssertionError
import java.util.HashMap

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

    /*v10todo
    @ReactProp(name="maxBounds")
    public void setMaxBounds(RCTMGLCamera camera, String value) {
        if (value != null) {
            FeatureCollection collection = FeatureCollection.fromJson(value);
            camera.setMaxBounds(GeoJSONUtils.toLatLngBounds(collection));
        }
    }
*/
    @ReactProp(name = "userTrackingMode")
    fun setUserTrackingMode(camera: RCTMGLCamera, userTrackingMode: Int) {
        camera.setUserTrackingMode(userTrackingMode)
        throw AssertionError("Unused code")
    }

    @ReactProp(name = "followZoomLevel")
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

    companion object {
        const val REACT_CLASS = "RCTMGLCamera"
    }
}