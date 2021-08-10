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

        // style source constants
        Map<String, String> styleSourceConsts = new HashMap<>();
        styleSourceConsts.put("DefaultSourceID", "TODO-defautl id"); //v10todo

        // line layer constants
        Map<String, String> lineJoin = new HashMap<>();
        lineJoin.put("Bevel", LineJoin.BEVEL.getValue());
        lineJoin.put("Round", LineJoin.ROUND.getValue());
        lineJoin.put("Miter", LineJoin.MITER.getValue());

        // location module callback names
        Map<String, String> locationModuleCallbackNames = new HashMap<>();
        locationModuleCallbackNames.put("Update", RCTMGLLocationModule.LOCATION_UPDATE);

        return MapBuilder.<String, Object>builder()
                .put("StyleURL", styleURLS)
                .put("StyleSource", styleSourceConsts)
                .put("LineJoin", lineJoin)
                .put("LocationCallbackName", locationModuleCallbackNames)
                .build();

    }

    @ReactMethod
    public void setAccessToken(final String accessToken) {
        mReactContext.runOnUiQueueThread(new Runnable() {
            @Override
            public void run() {
                ResourceOptionsManager.Companion.getDefault(getReactApplicationContext(), accessToken);
                //Mapbox.getInstance(getReactApplicationContext(), accessToken);
            }
        });
    }
}