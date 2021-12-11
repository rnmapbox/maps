package com.mapbox.rctmgl.modules;
import android.os.Handler;

import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.common.MapBuilder;

import com.mapbox.maps.extension.style.layers.properties.generated.LineJoin;

import com.mapbox.maps.Style;
import com.mapbox.maps.ResourceOptions;
import com.mapbox.maps.ResourceOptionsManager;

import com.mapbox.rctmgl.components.camera.constants.CameraMode;
import com.mapbox.rctmgl.events.constants.EventTypes;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

@ReactModule(name = RCTMGLModule.REACT_CLASS)
public class RCTMGLModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "RCTMGLModule";

    private static boolean customHeaderInterceptorAdded = false;

    private Handler mUiThreadHandler;
    private ReactApplicationContext mReactContext;


    @Override
    public String getName() {
        return REACT_CLASS;
    }

    public RCTMGLModule(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
        mReactContext = reactApplicationContext;
    }

    @Override
    @Nullable
    public Map<String, Object> getConstants() {
        // map style urls
        Map<String, String> styleURLS = new HashMap<>();
        styleURLS.put("Street", Style.MAPBOX_STREETS);
        styleURLS.put("Dark", Style.DARK);
        styleURLS.put("Light", Style.LIGHT);
        styleURLS.put("Outdoors", Style.OUTDOORS);
        styleURLS.put("Satellite", Style.SATELLITE);
        styleURLS.put("SatelliteStreet", Style.SATELLITE_STREETS);
        styleURLS.put("TrafficDay", Style.TRAFFIC_DAY);
        styleURLS.put("TrafficNight", Style.TRAFFIC_NIGHT);

        // events
        Map<String, String> eventTypes = new HashMap<>();
        eventTypes.put("MapClick", EventTypes.MAP_CLICK);
        eventTypes.put("MapLongClick", EventTypes.MAP_LONG_CLICK);
        eventTypes.put("RegionWillChange", EventTypes.REGION_WILL_CHANGE);
        eventTypes.put("RegionIsChanging", EventTypes.REGION_IS_CHANGING);
        eventTypes.put("RegionDidChange", EventTypes.REGION_DID_CHANGE);
        eventTypes.put("UserLocationUpdated", EventTypes.USER_LOCATION_UPDATED);
        eventTypes.put("WillStartLoadingMap", EventTypes.WILL_START_LOADING_MAP);
        eventTypes.put("DidFinishLoadingMap", EventTypes.DID_FINISH_LOADING_MAP);
        eventTypes.put("DidFailLoadingMap", EventTypes.DID_FAIL_LOADING_MAP);
        eventTypes.put("WillStartRenderingFrame", EventTypes.WILL_START_RENDERING_FRAME);
        eventTypes.put("DidFinishRenderingFrame", EventTypes.DID_FINISH_RENDERING_FRAME);
        eventTypes.put("DidFinishRenderingFrameFully", EventTypes.DID_FINISH_RENDERING_FRAME_FULLY);
        eventTypes.put("WillStartRenderingMap", EventTypes.WILL_START_RENDERING_MAP);
        eventTypes.put("DidFinishRenderingMap", EventTypes.DID_FINISH_RENDERING_MAP);
        eventTypes.put("DidFinishRenderingMapFully", EventTypes.DID_FINISH_RENDERING_MAP_FULLY);
        eventTypes.put("DidFinishLoadingStyle", EventTypes.DID_FINISH_LOADING_STYLE);

        // style source constants
        Map<String, String> styleSourceConsts = new HashMap<>();
        styleSourceConsts.put("DefaultSourceID", "TODO-defautl id"); //v10todo

        // line layer constants
        Map<String, String> lineJoin = new HashMap<>();
        lineJoin.put("Bevel", LineJoin.BEVEL.getValue());
        lineJoin.put("Round", LineJoin.ROUND.getValue());
        lineJoin.put("Miter", LineJoin.MITER.getValue());

        // camera modes
        Map<String, Integer> cameraModes = new HashMap<>();
        cameraModes.put("Flight", CameraMode.FLIGHT);
        cameraModes.put("Ease", CameraMode.EASE);
        cameraModes.put("Linear", CameraMode.LINEAR);
        cameraModes.put("None", CameraMode.NONE);

        // offline region download states
        Map<String, String> offlinePackDownloadStates = new HashMap<>();
        offlinePackDownloadStates.put("Inactive", RCTMGLOfflineModule.INACTIVE_REGION_DOWNLOAD_STATE);
        offlinePackDownloadStates.put("Active", RCTMGLOfflineModule.ACTIVE_REGION_DOWNLOAD_STATE);
        offlinePackDownloadStates.put("Complete", RCTMGLOfflineModule.COMPLETE_REGION_DOWNLOAD_STATE);

        // offline module callback names
        Map<String, String> offlineModuleCallbackNames = new HashMap<>();
        offlineModuleCallbackNames.put("Error", RCTMGLOfflineModule.OFFLINE_ERROR);
        offlineModuleCallbackNames.put("Progress", RCTMGLOfflineModule.OFFLINE_PROGRESS);

        // location module callback names
        Map<String, String> locationModuleCallbackNames = new HashMap<>();
        locationModuleCallbackNames.put("Update", RCTMGLLocationModule.LOCATION_UPDATE);

        return MapBuilder.<String, Object>builder()
                .put("StyleURL", styleURLS)
                .put("EventTypes", eventTypes)
                .put("StyleSource", styleSourceConsts)
                .put("CameraModes", cameraModes)
                .put("LineJoin", lineJoin)
                .put("OfflinePackDownloadState", offlinePackDownloadStates)
                .put("OfflineCallbackName", offlineModuleCallbackNames)
                .put("LocationCallbackName", locationModuleCallbackNames)
                .build();

    }

    public static String getAccessToken(ReactApplicationContext reactContext) {
        return ResourceOptionsManager.Companion.getDefault(reactContext, null).getResourceOptions().getAccessToken();
    }

    @ReactMethod
    public void setAccessToken(final String accessToken) {
        mReactContext.runOnUiQueueThread(new Runnable() {
            @Override
            public void run() {
                ResourceOptionsManager.Companion.getDefault(getReactApplicationContext(), accessToken);
            }
        });
    }
}