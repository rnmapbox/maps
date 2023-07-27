package com.mapbox.rctmgl.modules

import android.os.Handler
import com.facebook.react.bridge.Promise
import com.mapbox.maps.extension.style.layers.properties.generated.LineJoin
import com.mapbox.maps.ResourceOptionsManager.Companion.getDefault
import com.facebook.react.module.annotations.ReactModule
import com.mapbox.rctmgl.modules.RCTMGLModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.mapbox.rctmgl.events.constants.EventTypes
import com.mapbox.rctmgl.modules.RCTMGLOfflineModule
import com.mapbox.rctmgl.modules.RCTMGLLocationModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.common.MapBuilder
import com.mapbox.common.*
import com.mapbox.maps.MapView
import com.mapbox.maps.Style
import com.mapbox.maps.plugin.attribution.attribution
import com.mapbox.rctmgl.components.camera.constants.CameraMode
import java.util.HashMap

@ReactModule(name = RCTMGLModule.REACT_CLASS)
class RCTMGLModule(private val mReactContext: ReactApplicationContext) : ReactContextBaseJavaModule(
    mReactContext
) {
    private val mUiThreadHandler: Handler? = null
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun getConstants(): Map<String, Any>? {
        // map style urls
        val styleURLS: MutableMap<String, String> = HashMap()
        styleURLS["Street"] = Style.MAPBOX_STREETS
        styleURLS["Dark"] = Style.DARK
        styleURLS["Light"] = Style.LIGHT
        styleURLS["Outdoors"] = Style.OUTDOORS
        styleURLS["Satellite"] = Style.SATELLITE
        styleURLS["SatelliteStreet"] = Style.SATELLITE_STREETS
        styleURLS["TrafficDay"] = Style.TRAFFIC_DAY
        styleURLS["TrafficNight"] = Style.TRAFFIC_NIGHT

        // tile server
        val tileServers: MutableMap<String, String> = HashMap()
        tileServers["Mapbox"] = "mapbox"

        // impl
        val impl: MutableMap<String, String> = HashMap()
        impl["Library"] = "mapbox"

        // events
        val eventTypes: MutableMap<String, String> = HashMap()
        eventTypes["MapClick"] = EventTypes.MAP_CLICK
        eventTypes["MapLongClick"] = EventTypes.MAP_LONG_CLICK
        eventTypes["RegionWillChange"] = EventTypes.REGION_WILL_CHANGE
        eventTypes["RegionIsChanging"] = EventTypes.REGION_IS_CHANGING // deprecated
        eventTypes["CameraChanged"] = EventTypes.CAMERA_CHANGED
        eventTypes["RegionDidChange"] = EventTypes.REGION_DID_CHANGE // deprecated
        eventTypes["MapIdle"] = EventTypes.MAP_IDLE
        eventTypes["UserLocationUpdated"] = EventTypes.USER_LOCATION_UPDATED
        eventTypes["WillStartLoadingMap"] = EventTypes.WILL_START_LOADING_MAP
        eventTypes["DidFinishLoadingMap"] = EventTypes.DID_FINISH_LOADING_MAP
        eventTypes["DidFailLoadingMap"] = EventTypes.DID_FAIL_LOADING_MAP
        eventTypes["WillStartRenderingFrame"] = EventTypes.WILL_START_RENDERING_FRAME
        eventTypes["DidFinishRenderingFrame"] = EventTypes.DID_FINISH_RENDERING_FRAME
        eventTypes["DidFinishRenderingFrameFully"] = EventTypes.DID_FINISH_RENDERING_FRAME_FULLY
        eventTypes["WillStartRenderingMap"] = EventTypes.WILL_START_RENDERING_MAP
        eventTypes["DidFinishRenderingMap"] = EventTypes.DID_FINISH_RENDERING_MAP
        eventTypes["DidFinishRenderingMapFully"] = EventTypes.DID_FINISH_RENDERING_MAP_FULLY
        eventTypes["DidFinishLoadingStyle"] = EventTypes.DID_FINISH_LOADING_STYLE
        eventTypes["MapLoadingError"] = EventTypes.MAP_LOADING_ERROR

        // style source constants
        val styleSourceConsts: MutableMap<String, String> = HashMap()
        styleSourceConsts["DefaultSourceID"] = "composite"

        // line layer constants
        val lineJoin: MutableMap<String, String> = HashMap()
        lineJoin["Bevel"] = LineJoin.BEVEL.value
        lineJoin["Round"] = LineJoin.ROUND.value
        lineJoin["Miter"] = LineJoin.MITER.value

        // camera modes
        val cameraModes: MutableMap<String, Int> = HashMap()
        cameraModes["Flight"] = CameraMode.FLIGHT
        cameraModes["Ease"] = CameraMode.EASE
        cameraModes["Linear"] = CameraMode.LINEAR
        cameraModes["None"] = CameraMode.NONE

        // offline region download states
        val offlinePackDownloadStates: MutableMap<String, String> = HashMap()
        offlinePackDownloadStates["Inactive"] = TileRegionPackState.INACTIVE.rawValue
        offlinePackDownloadStates["Active"] = TileRegionPackState.ACTIVE.rawValue
        offlinePackDownloadStates["Complete"] = TileRegionPackState.COMPLETE.rawValue
        offlinePackDownloadStates["Unknown"] = TileRegionPackState.UNKNOWN.rawValue

        // offline module callback names
        val offlineModuleCallbackNames: MutableMap<String, String> = HashMap()
        offlineModuleCallbackNames["Error"] = RCTMGLOfflineModule.OFFLINE_ERROR
        offlineModuleCallbackNames["Progress"] = RCTMGLOfflineModule.OFFLINE_PROGRESS

        // location module callback names
        val locationModuleCallbackNames: MutableMap<String, String> = HashMap()
        locationModuleCallbackNames["Update"] = RCTMGLLocationModule.LOCATION_UPDATE
        return MapBuilder.builder<String, Any>()
            .put("MapboxV10", true)
            .put("StyleURL", styleURLS)
            .put("EventTypes", eventTypes)
            .put("StyleSource", styleSourceConsts)
            .put("CameraModes", cameraModes)
            .put("LineJoin", lineJoin)
            .put("OfflinePackDownloadState", offlinePackDownloadStates)
            .put("OfflineCallbackName", offlineModuleCallbackNames)
            .put("LocationCallbackName", locationModuleCallbackNames)
            .put("TileServers", tileServers)
            .put("Implementation", impl)
            .build()
    }

    @ReactMethod
    fun setTelemetryEnabled(telemetryEnabled: Boolean) {
        mReactContext.runOnUiQueueThread {
            val dummyView = MapView(mReactContext)
            val telemetry = dummyView.attribution.getMapAttributionDelegate().telemetry()
            telemetry.userTelemetryRequestState = telemetryEnabled
        }
    }

    @ReactMethod
    fun setAccessToken(accessToken: String?, promise: Promise) {
        mReactContext.runOnUiQueueThread(Runnable {
            getDefault(
                reactApplicationContext, accessToken
            )
            promise.resolve(accessToken)
        })
    }

    @ReactMethod
    fun setWellKnownTileServer(tileServer: String?) {
        // NO-OP
    }

    @ReactMethod
    fun addCustomHeader(headerName: String, headerValue: String) {
        CustomHttpHeaders.addCustomHeader(headerName, headerValue)
    }

    @ReactMethod
    fun removeCustomHeader(headerName: String) {
        CustomHttpHeaders.removeCustomHeader(headerName)
    }

    companion object {
        const val REACT_CLASS = "RCTMGLModule"
        private val customHeaderInterceptorAdded = false
        @JvmStatic
        fun getAccessToken(reactContext: ReactApplicationContext?): String {
            return getDefault((reactContext)!!, null).resourceOptions.accessToken
        }
    }
}
