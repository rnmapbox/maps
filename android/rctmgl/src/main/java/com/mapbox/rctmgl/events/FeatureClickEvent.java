package com.mapbox.rctmgl.events;

import android.os.StrictMode;
import android.view.View;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.google.gson.JsonObject;
import com.mapbox.rctmgl.events.AbstractEvent;
import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.events.constants.EventTypes;
import com.mapbox.rctmgl.utils.ConvertUtils;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.services.commons.geojson.Feature;
import com.mapbox.services.commons.geojson.Geometry;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by nickitaliano on 11/7/17.
 */

public class FeatureClickEvent extends AbstractEvent {
    private String mEventKey;
    private Feature mFeature;

    public FeatureClickEvent(View view, String eventKey, String eventType, Feature feature) {
        super(view, eventType);
        mFeature = feature;
        mEventKey = eventKey;
    }

    @Override
    public String getKey() {
        return mEventKey;
    }

    @Override
    public WritableMap getPayload() {
        return GeoJSONUtils.fromFeature(mFeature);
    }

    public static FeatureClickEvent makeShapeSourceEvent(View view, Feature feature) {
        return new FeatureClickEvent(view, EventKeys.SHAPE_SOURCE_LAYER_CLICK,
                EventTypes.SHAPE_SOURCE_LAYER_CLICK, feature);
    }

    public static FeatureClickEvent makeVectorSourceEvent(View view, Feature feature) {
        return new FeatureClickEvent(view, EventKeys.VECTOR_SOURCE_LAYER_CLICK,
                EventTypes.VECTOR_SOURCE_LAYER_CLICK, feature);
    }

    public static FeatureClickEvent makeRasterSourceEvent(View view, Feature feature) {
        return new FeatureClickEvent(view, EventKeys.RASTER_SOURCE_LAYER_CLICK,
                EventTypes.RASTER_SOURCE_LAYER_CLICK, feature);
    }
}
