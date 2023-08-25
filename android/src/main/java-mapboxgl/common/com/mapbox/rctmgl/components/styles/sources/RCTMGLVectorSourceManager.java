package com.mapbox.rctmgl.components.styles.sources;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.utils.ConvertUtils;
import com.mapbox.rctmgl.utils.ExpressionParser;

import javax.annotation.Nonnull;

import java.util.Map;

/**
 * Created by nickitaliano on 9/8/17.
 */

public class RCTMGLVectorSourceManager extends RCTMGLTileSourceManager<RCTMGLVectorSource> {
    public static final String REACT_CLASS = "RCTMGLVectorSource";

    public RCTMGLVectorSourceManager(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Nonnull
    @Override
    protected RCTMGLVectorSource createViewInstance(@Nonnull ThemedReactContext reactContext) {
        return new RCTMGLVectorSource(reactContext, this);
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
