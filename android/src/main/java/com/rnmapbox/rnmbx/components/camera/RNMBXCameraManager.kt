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
import com.rnmapbox.rnmbx.utils.ViewTagResolver
import com.rnmapbox.rnmbx.utils.extensions.asBooleanOrNull
import com.rnmapbox.rnmbx.utils.extensions.asDoubleOrNull
import com.rnmapbox.rnmbx.utils.extensions.asStringOrNull
import com.rnmapbox.rnmbx.rncompat.dynamic.*

class RNMBXCameraManager(private val mContext: ReactApplicationContext, val viewTagResolver: ViewTagResolver) :
    AbstractEventEmitter<RNMBXCamera>(
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
    override fun setStop(camera: RNMBXCamera, map: Dynamic) {
        if (!map.isNull) {
            val stop = fromReadableMap(mContext, map.asMap(), null)
            camera.setStop(stop)
        }
    }

    @ReactProp(name = "defaultStop")
    override fun setDefaultStop(camera: RNMBXCamera, map: Dynamic) {
        if (!map.isNull) {
            val stop = fromReadableMap(mContext, map.asMap(), null)
            camera.setDefaultStop(stop)
        }
    }

    @ReactProp(name = "userTrackingMode")
    override fun setUserTrackingMode(camera: RNMBXCamera, userTrackingMode: Dynamic) {
        camera.setUserTrackingMode(userTrackingMode.asInt())
        throw AssertionError("Unused code")
    }

    @ReactProp(name = "zoomLevel")
    override fun setZoomLevel(camera: RNMBXCamera, zoomLevel: Dynamic) {
        camera.setZoomLevel(zoomLevel.asDouble())
    }

    @ReactProp(name = "minZoomLevel")
    override fun setMinZoomLevel(camera: RNMBXCamera, value: Dynamic) {
        camera.setMinZoomLevel(value.asDoubleOrNull())
    }

    @ReactProp(name = "maxZoomLevel")
    override fun setMaxZoomLevel(camera: RNMBXCamera, value: Dynamic) {
        camera.setMaxZoomLevel(value.asDoubleOrNull())
    }

    @ReactProp(name = "followUserLocation")
    override fun setFollowUserLocation(camera: RNMBXCamera, value: Dynamic) {
        camera.setFollowUserLocation(value.asBooleanOrNull())
    }

    @ReactProp(name = "followUserMode")
    override fun setFollowUserMode(camera: RNMBXCamera, value: Dynamic) {
        camera.setFollowUserMode(value.asStringOrNull())
    }

    @ReactProp(name = "followZoomLevel")
    override fun setFollowZoomLevel(camera: RNMBXCamera, value: Dynamic) {
        camera.setFollowZoomLevel(value.asDoubleOrNull())
    }

    @ReactProp(name = "followPitch")
    override fun setFollowPitch(camera: RNMBXCamera, value: Dynamic) {
        camera.setFollowPitch(value.asDoubleOrNull())
    }

    @ReactProp(name = "followHeading")
    override fun setFollowHeading(camera: RNMBXCamera, value: Dynamic) {
        camera.setFollowHeading(value.asDoubleOrNull())
    }

    @ReactProp(name = "followPadding")
    override fun setFollowPadding(camera: RNMBXCamera, value: Dynamic) {
        camera.setFollowPadding(value.asMap())
    }

    @ReactProp(name = "maxBounds")
    override fun setMaxBounds(camera: RNMBXCamera, value: Dynamic) {
        if (!value.isNull) {
            val collection = FeatureCollection.fromJson(value.asString())
            camera.setMaxBounds(toLatLngBounds(collection))
        } else {
            camera.setMaxBounds(null)
        }
    }

    override fun setAnimationDuration(view: RNMBXCamera?, value: Dynamic) {
        // no-op on Android
    }

    override fun setAnimationMode(view: RNMBXCamera?, value: Dynamic) {
        // no-op on Android
    }

    companion object {
        const val REACT_CLASS = "RNMBXCamera"
    }
}