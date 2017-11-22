package com.mapbox.rctmgl.utils;

import android.graphics.PointF;
import android.graphics.RectF;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.NoSuchKeyException;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;
import com.mapbox.mapboxsdk.style.layers.Filter;
import com.mapbox.rctmgl.events.IEvent;
import com.mapbox.services.commons.geojson.Feature;
import com.mapbox.services.commons.geojson.FeatureCollection;
import com.mapbox.services.commons.geojson.Point;
import com.mapbox.services.commons.models.Position;

import java.text.NumberFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class ConvertUtils {
    public static final String LOG_TAG = ConvertUtils.class.getSimpleName();

    public static WritableMap toPointFeature(LatLng latLng, WritableMap properties) {
        WritableMap map = new WritableNativeMap();
        map.putString("type", "Feature");
        map.putMap("geometry", toPointGeometry(latLng));
        map.putMap("properties", properties);
        return map;
    }

    public static WritableMap toPointGeometry(LatLng latLng) {
        WritableMap geometry = new WritableNativeMap();
        geometry.putString("type", "Point");
        geometry.putArray("coordinates", fromLatLng(latLng));
        return geometry;
    }

    public static WritableArray fromLatLng(LatLng latLng) {
        double[] coords = new double[]{ latLng.getLongitude(), latLng.getLatitude() };
        WritableArray writableCoords = new WritableNativeArray();
        writableCoords.pushDouble(coords[0]);
        writableCoords.pushDouble(coords[1]);
        return writableCoords;
    }

    public static WritableArray fromLatLngBounds(LatLngBounds latLngBounds) {
        WritableArray array = Arguments.createArray();

        LatLng[] latLngs = latLngBounds.toLatLngs();
        for (LatLng latLng : latLngs) {
            array.pushArray(fromLatLng(latLng));
        }

        return array;
    }

    public static LatLng toLatLng(Point point) {
        if (point == null) {
            return null;
        }

        Position position = point.getCoordinates();
        if (position == null) {
            return null;
        }

        return new LatLng(position.getLatitude(), position.getLongitude());
    }

    public static Point toPointGemetry(String featureJSONString) {
        Feature feature = Feature.fromJson(featureJSONString);
        if (feature == null) {
            return null;
        }
        return (Point)feature.getGeometry();
    }

    public static LatLngBounds toLatLngBounds(FeatureCollection featureCollection) {
        List<Feature> features = featureCollection.getFeatures();

        if (features.size() != 2) {
            return null;
        }

        LatLng neLatLng = ConvertUtils.toLatLng((Point)features.get(0).getGeometry());
        LatLng swLatLng = ConvertUtils.toLatLng((Point)features.get(1).getGeometry());

        return LatLngBounds.from(neLatLng.getLatitude(), neLatLng.getLongitude(),
                swLatLng.getLatitude(), swLatLng.getLongitude());
    }

    public static Object getObjectFromString(String str) {
        NumberFormat numberFormat = NumberFormat.getNumberInstance();

        try {
            return numberFormat.parse(str);
        } catch (ParseException e) {
            // ignore we're just figuring out what type this is
        }

        return str;
    }

    public static List<String> toStringList(ReadableArray array) {
        List<String> list = new ArrayList<>();

        if (array == null) {
            return list;
        }

        for (int i = 0; i < array.size(); i++) {
            list.add(array.getString(i));
        }

        return list;
    }

    public static PointF toPointF(ReadableArray array) {
        PointF pointF = new PointF();

        if (array == null) {
            return pointF;
        }

        pointF.set((float)array.getDouble(0), (float)array.getDouble(1));
        return pointF;
    }

    public static RectF toRectF(ReadableArray array) {
        RectF rectF = new RectF();

        if (array == null) {
            return rectF;
        }

        rectF.set((float)array.getDouble(3), (float)array.getDouble(0), (float)array.getDouble(1), (float)array.getDouble(2));
        return rectF;
    }

    public static double getDouble(String key, ReadableMap map, double defaultValue) {
        double value = defaultValue;

        try {
            value = map.getDouble(key);
        } catch (NoSuchKeyException e) {
            // key not found use default value
            Log.d(LOG_TAG, String.format("No key found for %s, using default value %f", key, defaultValue));
        }

        return value;
    }

    public static String getString(String key, ReadableMap map, String defaultValue) {
        String value = defaultValue;

        try {
            value = map.getString(key);
        } catch (NoSuchKeyException e) {
            // key not found use default value
            Log.d(LOG_TAG, String.format("No key found for %s, using default value %s", key, defaultValue));
        }

        return value;
    }
}
