package com.mapbox.rctmgl.modules;

import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.mapbox.mapboxsdk.Mapbox;
import com.mapbox.mapboxsdk.constants.Style;
import com.mapbox.mapboxsdk.offline.OfflineRegion;
import com.mapbox.mapboxsdk.plugins.locationlayer.LocationLayerMode;
import com.mapbox.mapboxsdk.storage.FileSource;
import com.mapbox.mapboxsdk.style.layers.Property;
import com.mapbox.rctmgl.components.camera.constants.CameraMode;
import com.mapbox.rctmgl.components.styles.RCTMGLStyleValue;
import com.mapbox.rctmgl.components.styles.sources.RCTSource;
import com.mapbox.rctmgl.events.constants.EventTypes;
import com.mapbox.rctmgl.location.UserLocationVerticalAlignment;
import com.mapbox.rctmgl.location.UserTrackingMode;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class RCTMGLModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = RCTMGLModule.class.getSimpleName();

    private Handler mUiThreadHandler;
    private ReactApplicationContext mReactContext;

    public RCTMGLModule(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
        mReactContext = reactApplicationContext;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
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
        eventTypes.put("RegionWilChange", EventTypes.REGION_WILL_CHANGE);
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

        // user tracking modes
        Map<String, Integer> userTrackingModes = new HashMap<>();
        userTrackingModes.put("None", UserTrackingMode.NONE);
        userTrackingModes.put("Follow", UserTrackingMode.FOLLOW);
        userTrackingModes.put("FollowWithCourse", UserTrackingMode.FollowWithCourse);
        userTrackingModes.put("FollowWithHeading", UserTrackingMode.FollowWithHeading);

        // user location vertical alignment
        Map<String, Integer> userLocationVerticalAlignment = new HashMap<>();
        userLocationVerticalAlignment.put("Center", UserLocationVerticalAlignment.CENTER);
        userLocationVerticalAlignment.put("Top", UserLocationVerticalAlignment.TOP);
        userLocationVerticalAlignment.put("Bottom", UserLocationVerticalAlignment.BOTTOM);

        // camera modes
        Map<String, Integer> cameraModes = new HashMap<>();
        cameraModes.put("Flight", CameraMode.FLIGHT);
        cameraModes.put("Ease", CameraMode.EASE);
        cameraModes.put("None", CameraMode.NONE);

        // style source constants
        Map<String, String> styleSourceConsts = new HashMap<>();
        styleSourceConsts.put("DefaultSourceID", RCTSource.DEFAULT_ID);

        // interpolation modes
        Map<String, Integer> interpolationModes = new HashMap<>();
        interpolationModes.put("Exponential", RCTMGLStyleValue.InterpolationModeExponential);
        interpolationModes.put("Categorical", RCTMGLStyleValue.InterpolationModeCategorical);
        interpolationModes.put("Interval", RCTMGLStyleValue.InterpolationModeInterval);
        interpolationModes.put("Identity", RCTMGLStyleValue.InterpolationModeIdentity);

        // line layer constants
        Map<String, String> lineJoin = new HashMap<>();
        lineJoin.put("Bevel", Property.LINE_JOIN_BEVEL);
        lineJoin.put("Round", Property.LINE_JOIN_ROUND);
        lineJoin.put("Miter", Property.LINE_JOIN_MITER);

        Map<String, String> lineCap = new HashMap<>();
        lineCap.put("Butt", Property.LINE_CAP_BUTT);
        lineCap.put("Round", Property.LINE_CAP_ROUND);
        lineCap.put("Square", Property.LINE_CAP_SQUARE);

        Map<String, String> lineTranslateAnchor = new HashMap<>();
        lineTranslateAnchor.put("Map", Property.LINE_TRANSLATE_ANCHOR_MAP);
        lineTranslateAnchor.put("Viewport", Property.LINE_TRANSLATE_ANCHOR_VIEWPORT);

        // circle layer constants
        Map<String, String> circlePitchScale = new HashMap<>();
        circlePitchScale.put("Map", Property.CIRCLE_PITCH_SCALE_MAP);
        circlePitchScale.put("Viewport", Property.CIRCLE_PITCH_SCALE_VIEWPORT);

        Map<String, String> circleTranslateAnchor = new HashMap<>();
        circleTranslateAnchor.put("Map", Property.CIRCLE_TRANSLATE_ANCHOR_MAP);
        circleTranslateAnchor.put("Viewport", Property.CIRCLE_TRANSLATE_ANCHOR_VIEWPORT);

        Map<String, String> circlePitchAlignment = new HashMap<>();
        circlePitchAlignment.put("Map", Property.CIRCLE_PITCH_ALIGNMENT_MAP);
        circlePitchAlignment.put("Viewport", Property.CIRCLE_PITCH_ALIGNMENT_VIEWPORT);

        // fill extrusion layer constants
        Map<String, String> fillExtrusionTranslateAnchor = new HashMap<>();
        fillExtrusionTranslateAnchor.put("Map", Property.FILL_EXTRUSION_TRANSLATE_ANCHOR_MAP);
        fillExtrusionTranslateAnchor.put("Viewport", Property.FILL_EXTRUSION_TRANSLATE_ANCHOR_VIEWPORT);

        // fill layer constants
        Map<String, String> fillTranslateAnchor = new HashMap<>();
        fillTranslateAnchor.put("Map", Property.FILL_TRANSLATE_ANCHOR_MAP);
        fillTranslateAnchor.put("Viewport", Property.FILL_TRANSLATE_ANCHOR_VIEWPORT);

        // symbol layer constants
        Map<String, String> iconRotationAlignment = new HashMap<>();
        iconRotationAlignment.put("Auto", Property.ICON_ROTATION_ALIGNMENT_AUTO);
        iconRotationAlignment.put("Map", Property.ICON_ROTATION_ALIGNMENT_MAP);
        iconRotationAlignment.put("Viewport", Property.ICON_ROTATION_ALIGNMENT_VIEWPORT);

        Map<String, String> iconTextFit = new HashMap<>();
        iconTextFit.put("None", Property.ICON_TEXT_FIT_NONE);
        iconTextFit.put("Width", Property.ICON_TEXT_FIT_WIDTH);
        iconTextFit.put("Height", Property.ICON_TEXT_FIT_HEIGHT);
        iconTextFit.put("Both", Property.ICON_TEXT_FIT_BOTH);

        Map<String, String> iconAnchor = new HashMap<>();
        iconAnchor.put("Center", Property.ICON_ANCHOR_CENTER);
        iconAnchor.put("Left", Property.ICON_ANCHOR_LEFT);
        iconAnchor.put("Right", Property.ICON_ANCHOR_RIGHT);
        iconAnchor.put("Top", Property.ICON_ANCHOR_TOP);
        iconAnchor.put("Bottom", Property.ICON_ANCHOR_BOTTOM);
        iconAnchor.put("TopLeft", Property.ICON_ANCHOR_TOP_LEFT);
        iconAnchor.put("TopRight", Property.ICON_ANCHOR_TOP_RIGHT);
        iconAnchor.put("BottomLeft", Property.ICON_ANCHOR_BOTTOM_LEFT);
        iconAnchor.put("BottomRight", Property.ICON_ANCHOR_BOTTOM_RIGHT);

        Map<String, String> iconPitchAlignment = new HashMap<>();
        iconPitchAlignment.put("Auto", Property.ICON_PITCH_ALIGNMENT_AUTO);
        iconPitchAlignment.put("Map", Property.ICON_PITCH_ALIGNMENT_MAP);
        iconPitchAlignment.put("Viewport", Property.ICON_PITCH_ALIGNMENT_VIEWPORT);

        Map<String, String> iconTranslateAnchor = new HashMap<>();
        iconTranslateAnchor.put("Map", Property.ICON_TRANSLATE_ANCHOR_MAP);
        iconTranslateAnchor.put("Viewport", Property.ICON_TRANSLATE_ANCHOR_VIEWPORT);

        Map<String, String> symbolPlacement = new HashMap<>();
        symbolPlacement.put("Line", Property.SYMBOL_PLACEMENT_LINE);
        symbolPlacement.put("Point", Property.SYMBOL_PLACEMENT_POINT);

        Map<String, String> textAnchor = new HashMap<>();
        textAnchor.put("Center", Property.TEXT_ANCHOR_CENTER);
        textAnchor.put("Left", Property.TEXT_ANCHOR_LEFT);
        textAnchor.put("Right", Property.TEXT_ANCHOR_RIGHT);
        textAnchor.put("Top", Property.TEXT_ANCHOR_TOP);
        textAnchor.put("Bottom", Property.TEXT_ANCHOR_BOTTOM);
        textAnchor.put("TopLeft", Property.TEXT_ANCHOR_TOP_LEFT);
        textAnchor.put("TopRight", Property.TEXT_ANCHOR_TOP_RIGHT);
        textAnchor.put("BottomLeft", Property.TEXT_ANCHOR_BOTTOM_LEFT);
        textAnchor.put("BottomRight", Property.TEXT_ANCHOR_BOTTOM_RIGHT);

        Map<String, String> textJustify = new HashMap<>();
        textJustify.put("Center", Property.TEXT_JUSTIFY_CENTER);
        textJustify.put("Left", Property.TEXT_JUSTIFY_LEFT);
        textJustify.put("Right", Property.TEXT_JUSTIFY_RIGHT);

        Map<String, String> textPitchAlignment = new HashMap<>();
        textPitchAlignment.put("Auto", Property.TEXT_PITCH_ALIGNMENT_AUTO);
        textPitchAlignment.put("Map", Property.TEXT_PITCH_ALIGNMENT_MAP);
        textPitchAlignment.put("Viewport", Property.TEXT_PITCH_ALIGNMENT_VIEWPORT);

        Map<String, String> textRotationAlignment = new HashMap<>();
        textRotationAlignment.put("Auto", Property.TEXT_ROTATION_ALIGNMENT_AUTO);
        textRotationAlignment.put("Map", Property.TEXT_ROTATION_ALIGNMENT_MAP);
        textRotationAlignment.put("Viewport", Property.TEXT_ROTATION_ALIGNMENT_VIEWPORT);

        Map<String, String> textTransform = new HashMap<>();
        textTransform.put("None", Property.TEXT_TRANSFORM_NONE);
        textTransform.put("Lowercase", Property.TEXT_TRANSFORM_LOWERCASE);
        textTransform.put("Uppercase", Property.TEXT_TRANSFORM_UPPERCASE);

        Map<String, String> textTranslateAnchor = new HashMap<>();
        textTranslateAnchor.put("Map", Property.TEXT_TRANSLATE_ANCHOR_MAP);
        textTranslateAnchor.put("Viewport", Property.TEXT_TRANSLATE_ANCHOR_VIEWPORT);

        // light constants
        Map<String, String> lightAnchor = new HashMap<>();
        lightAnchor.put("Map", Property.ANCHOR_MAP);
        lightAnchor.put("Viewport", Property.ANCHOR_VIEWPORT);

        // offline region download states
        Map<String, Integer> offlinePackDownloadStates = new HashMap<>();
        offlinePackDownloadStates.put("Inactive", RCTMGLOfflineModule.INACTIVE_REGION_DOWNLOAD_STATE);
        offlinePackDownloadStates.put("Active", RCTMGLOfflineModule.ACTIVE_REGION_DOWNLOAD_STATE);
        offlinePackDownloadStates.put("Complete", RCTMGLOfflineModule.COMPLETE_REGION_DOWNLOAD_STATE);

        // offline module callback names
        Map<String, String> offlineModuleCallbackNames = new HashMap<>();
        offlineModuleCallbackNames.put("Error", RCTMGLOfflineModule.OFFLINE_ERROR);
        offlineModuleCallbackNames.put("Progress", RCTMGLOfflineModule.OFFLINE_PROGRESS);

        return MapBuilder.<String, Object>builder()
                .put("StyleURL", styleURLS)
                .put("EventTypes", eventTypes)
                .put("UserTrackingModes", userTrackingModes)
                .put("UserLocationVerticalAlignment", userLocationVerticalAlignment)
                .put("CameraModes", cameraModes)
                .put("StyleSource", styleSourceConsts)
                .put("InterpolationMode", interpolationModes)
                .put("LineJoin", lineJoin)
                .put("LineCap", lineCap)
                .put("LineTranslateAnchor", lineTranslateAnchor)
                .put("CirclePitchScale", circlePitchScale)
                .put("CircleTranslateAnchor", circleTranslateAnchor)
                .put("CirclePitchAlignment", circlePitchAlignment)
                .put("FillExtrusionTranslateAnchor", fillExtrusionTranslateAnchor)
                .put("FillTranslateAnchor", fillTranslateAnchor)
                .put("IconRotationAlignment", iconRotationAlignment)
                .put("IconTextFit", iconTextFit)
                .put("IconTranslateAnchor", iconTranslateAnchor)
                .put("SymbolPlacement", symbolPlacement)
                .put("IconAnchor", iconAnchor)
                .put("TextAnchor", textAnchor)
                .put("TextJustify", textJustify)
                .put("IconPitchAlignment", iconPitchAlignment)
                .put("TextPitchAlignment", textPitchAlignment)
                .put("TextRotationAlignment", textRotationAlignment)
                .put("TextTransform", textTransform)
                .put("TextTranslateAnchor", textTranslateAnchor)
                .put("LightAnchor", lightAnchor)
                .put("OfflinePackDownloadState", offlinePackDownloadStates)
                .put("OfflineCallbackName", offlineModuleCallbackNames)
                .build();
    }

    @ReactMethod
    public void setAccessToken(final String accessToken) {
        mReactContext.runOnUiQueueThread(new Runnable() {
            @Override
            public void run() {
                Mapbox.getInstance(getReactApplicationContext(), accessToken);
            }
        });
    }

    @ReactMethod
    public void getAccessToken(Promise promise) {
        WritableMap map = Arguments.createMap();
        map.putString("accessToken", Mapbox.getAccessToken());
        promise.resolve(map);
    }
}
