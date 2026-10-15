package com.rnmapbox.rnmbx.events;

import android.view.View;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.mapbox.geojson.Feature;
import com.mapbox.maps.ScreenCoordinate;
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXSource;
import com.rnmapbox.rnmbx.events.constants.EventKeys;
import com.rnmapbox.rnmbx.events.constants.EventTypes;
import com.rnmapbox.rnmbx.utils.GeoJSONUtils;
import com.rnmapbox.rnmbx.utils.LatLng;

import java.util.List;

/**
 * Created by nickitaliano on 11/7/17.
 */

public class FeatureClickEvent extends AbstractEvent {
    private String mEventKey;
    private List<Feature> mFeatures;
    private LatLng mLatLng;
    private ScreenCoordinate mPoint;

    public FeatureClickEvent(View view, String eventKey, String eventType, List<Feature> features, LatLng latLng, ScreenCoordinate point) {
        super(view, eventType);
        mFeatures = features;
        mEventKey = eventKey;
        mLatLng = latLng;
        mPoint = point;
    }

    @Override
    public String getKey() {
        return mEventKey;
    }

    @Override
    public WritableMap getPayload() {
        WritableMap map = Arguments.createMap();
        WritableArray features = Arguments.createArray();

        for(Feature feature : mFeatures) {
            features.pushMap(GeoJSONUtils.fromFeature(feature));
        }
        map.putArray("features", features);

        WritableMap coordinates = Arguments.createMap();
        coordinates.putDouble("latitude", mLatLng.getLatitude());
        coordinates.putDouble("longitude", mLatLng.getLongitude());
        map.putMap("coordinates", coordinates);

        WritableMap point = Arguments.createMap();
        point.putDouble("x", mPoint.getX());
        point.putDouble("y", mPoint.getY());
        map.putMap("point", point);

        return map;
    }

    public static FeatureClickEvent makeShapeSourceEvent(View view, RNMBXSource.OnPressEvent event) {
        return new FeatureClickEvent(view, EventKeys.SHAPE_SOURCE_LAYER_CLICK.getValue(),
                EventTypes.SHAPE_SOURCE_LAYER_CLICK, event.getFeatures(), event.getLatLng(), event.getScreenPoint());
    }

    public static FeatureClickEvent makeVectorSourceEvent(View view, RNMBXSource.OnPressEvent event) {
        return new FeatureClickEvent(view, EventKeys.VECTOR_SOURCE_LAYER_CLICK.getValue(),
                EventTypes.VECTOR_SOURCE_LAYER_CLICK, event.getFeatures(), event.getLatLng(), event.getScreenPoint());
    }

    public static FeatureClickEvent makeRasterSourceEvent(View view, RNMBXSource.OnPressEvent event) {
        return new FeatureClickEvent(view, EventKeys.RASTER_SOURCE_LAYER_CLICK.getValue(),
                EventTypes.RASTER_SOURCE_LAYER_CLICK, event.getFeatures(), event.getLatLng(), event.getScreenPoint());
    }
}
