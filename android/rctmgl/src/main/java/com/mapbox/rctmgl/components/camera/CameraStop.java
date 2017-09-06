package com.mapbox.rctmgl.components.camera;

import android.support.annotation.NonNull;

import com.facebook.react.bridge.ReadableMap;
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.rctmgl.components.camera.constants.CameraMode;
import com.mapbox.rctmgl.utils.ConvertUtils;
import com.mapbox.services.commons.geojson.FeatureCollection;
import com.mapbox.services.commons.geojson.Point;

/**
 * Created by nickitaliano on 9/5/17.
 */

public class CameraStop {
    private Double mBearing;
    private Double mTilt;
    private Double mZoom;
    private LatLng mLatLng;

    private LatLngBounds mBounds;
    private int mBoundsPadding = 0;
    private int mMode = CameraMode.EASE;
    private int mDuration = 2000;
    private MapboxMap.CancelableCallback mCallback;

    public CameraStop() {}

    public void setBearing(double bearing) {
        mBearing = bearing;
    }

    public void setTilt(double tilt) {
        mTilt = tilt;
    }

    public void setZoom(double zoom) {
        mZoom = zoom;
    }

    public void setLatLng(LatLng latLng) {
        mLatLng = latLng;
    }

    public void setDuration(int duration) {
        mDuration = duration;
    }

    public void setCallback(MapboxMap.CancelableCallback callback) {
        mCallback = callback;
    }

    public void setBounds(LatLngBounds bounds, int padding) {
        mBounds = bounds;
        mBoundsPadding = padding;
    }

    public void setMode(@CameraMode.Mode int mode) {
        mMode = mode;
    }

    public CameraUpdateItem toCameraUpdate() {
        if (mBounds != null) {
            CameraUpdate update = CameraUpdateFactory.newLatLngBounds(mBounds, mBoundsPadding);
            return new CameraUpdateItem(update, mDuration, mCallback, CameraMode.FLIGHT);
        }

        CameraPosition.Builder builder = new CameraPosition.Builder();

        if (mBearing != null) {
            builder.bearing(mBearing);
        }

        if (mTilt != null) {
            builder.tilt(mTilt);
        }

        if (mZoom != null) {
            builder.zoom(mZoom);
        }

        if (mLatLng != null) {
            builder.target(mLatLng);
        }

        return new CameraUpdateItem(CameraUpdateFactory.newCameraPosition(builder.build()), mDuration, mCallback, mMode);
    }

    public static CameraStop fromReadableMap(@NonNull ReadableMap readableMap, MapboxMap.CancelableCallback callback) {
        CameraStop stop = new CameraStop();

        if (readableMap.hasKey("pitch")) {
            stop.setTilt(readableMap.getDouble("pitch"));
        }

        if (readableMap.hasKey("heading")) {
            stop.setBearing(readableMap.getDouble("heading"));
        }

        if (readableMap.hasKey("centerCoordinate")) {
            Point target = ConvertUtils.toPointGemetry(readableMap.getString("centerCoordinate"));
            stop.setLatLng(ConvertUtils.toLatLng(target));
        }

        if (readableMap.hasKey("zoom")) {
            stop.setZoom(readableMap.getDouble("zoom"));
        }

        if (readableMap.hasKey("duration")) {
            stop.setDuration(readableMap.getInt("duration"));
        }

        if (readableMap.hasKey("bounds")) {
            int padding = readableMap.hasKey("boundsPadding") ? readableMap.getInt("boundsPadding") : 0;
            FeatureCollection collection = FeatureCollection.fromJson(readableMap.getString("bounds"));
            stop.setBounds(ConvertUtils.toLatLngBounds(collection), padding);
        }

        if (readableMap.hasKey("mode")) {
            switch (readableMap.getInt("mode")) {
                case CameraMode.FLIGHT:
                    stop.setMode(CameraMode.FLIGHT);
                    break;
                case CameraMode.NONE:
                    stop.setMode(CameraMode.NONE);
                    break;
                default:
                    stop.setMode(CameraMode.EASE);
            }
        }

        stop.setCallback(callback);
        return stop;
    }
}
