package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.media.Image;
import android.util.Log;
import android.view.View;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.rctmgl.components.AbstractEventEmitter;
// import com.mapbox.rctmgl.components.annotation.RCTMGLCallout;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.styles.layers.RCTLayer;
import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.utils.ExpressionParser;
import com.mapbox.rctmgl.utils.ImageEntry;
// import com.mapbox.rctmgl.utils.ResourceUtils;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class RCTMGLRasterDemSourceManager extends RCTMGLTileSourceManager<RCTMGLRasterDemSource> {
    public static final String LOG_TAG = "RCTMGLRasterDemSourceManager";
    public static final String REACT_CLASS = "RCTMGLRasterDemSource";

    private ReactApplicationContext mContext;

    public RCTMGLRasterDemSourceManager(ReactApplicationContext context) {
        super(context);
        mContext = context;
    }

    @Nullable
    @Override
    public Map<String, String> customEvents() {
        return MapBuilder.<String, String>builder()
                .build();
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLRasterDemSource createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLRasterDemSource(reactContext, this);
    }
}
