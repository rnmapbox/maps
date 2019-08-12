package com.mapbox.rctmgl.components.styles.sources;

import android.support.annotation.Nullable;
import android.view.View;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.rctmgl.components.AbstractEventEmitter;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.utils.ConvertUtils;
import com.mapbox.rctmgl.utils.ExpressionParser;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by nickitaliano on 9/8/17.
 */

public class RCTMGLVectorSourceManager extends AbstractEventEmitter<RCTMGLVectorSource> {
    public static final String REACT_CLASS = "RCTMGLVectorSource";

    public RCTMGLVectorSourceManager(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLVectorSource createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLVectorSource(reactContext, this);
    }

    @Override
    public View getChildAt(RCTMGLVectorSource source, int childPosition) {
        return source.getLayerAt(childPosition);
    }

    @Override
    public int getChildCount(RCTMGLVectorSource source) {
        return source.getLayerCount();
    }

    @Override
    public void addView(RCTMGLVectorSource source, View childView, int childPosition) {
        source.addLayer(childView, childPosition);
    }

    @Override
    public void removeViewAt(RCTMGLVectorSource source, int childPosition) {
        source.removeLayer(childPosition);
    }

    @ReactProp(name="id")
    public void setId(RCTMGLVectorSource source, String id) {
        source.setID(id);
    }

    @ReactProp(name="url")
    public void setUrl(RCTMGLVectorSource source, String url) {
        source.setURL(url);
    }

    @ReactProp(name = "hasPressListener")
    public void setHasPressListener(RCTMGLVectorSource source, boolean hasPressListener) {
        source.setHasPressListener(hasPressListener);
    }

    @ReactProp(name="hitbox")
    public void setHitbox(RCTMGLVectorSource source, ReadableMap map) {
        source.setHitbox(map);
    }

    @Override
    public Map<String, String> customEvents() {
        return MapBuilder.<String, String>builder()
                .put(EventKeys.VECTOR_SOURCE_LAYER_CLICK, "onMapboxVectorSourcePress")
                .put(EventKeys.MAP_ANDROID_CALLBACK, "onAndroidCallback")
                .build();
    }

    //region React Methods
    public static final int METHOD_FEATURES = 102;

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.<String, Integer>builder()
                .put("features", METHOD_FEATURES)
                .build();
    }

    @Override
    public void receiveCommand(RCTMGLVectorSource vectorSource, int commandID, @Nullable ReadableArray args) {

        switch (commandID) {
            case METHOD_FEATURES:
                vectorSource.querySourceFeatures(
                        args.getString(0),
                        ConvertUtils.toStringList(args.getArray(1)),
                        ExpressionParser.from(args.getArray(2))
                        );
                break;
        }
    }
}
