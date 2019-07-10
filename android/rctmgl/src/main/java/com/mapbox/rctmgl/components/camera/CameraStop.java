package com.mapbox.rctmgl.components.camera;

import android.content.Context;
import android.support.annotation.NonNull;
import android.util.DisplayMetrics;

import com.facebook.react.bridge.ReadableMap;
import com.mapbox.geojson.FeatureCollection;
import com.mapbox.geojson.Point;
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.rctmgl.components.camera.constants.CameraMode;
import com.mapbox.rctmgl.utils.GeoJSONUtils;

/**
 * Created by nickitaliano on 9/5/17.
 */

public class CameraStop {
    private Double mBearing;
    private Double mTilt;
    private Double mZoom;
    private LatLng mLatLng;

    private LatLngBounds mBounds;
    private int mBoundsPaddingLeft = 0;
    private int mBoundsPaddingRight = 0;
    private int mBoundsPaddingBottom = 0;
    private int mBoundsPaddingTop = 0;

    private int mMode = CameraMode.EASE;
    private int mDuration = 2000;
    private MapboxMap.CancelableCallback mCallback;

    public CameraStop() {
    }

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

    public void setBounds(LatLngBounds bounds, int paddingLeft, int paddingRight, int paddingTop, int paddingBottom) {
        mBounds = bounds;
        mBoundsPaddingLeft = paddingLeft;
        mBoundsPaddingRight = paddingRight;
        mBoundsPaddingTop = paddingTop;
        mBoundsPaddingBottom = paddingBottom;
    }

    public void setMode(@CameraMode.Mode int mode) {
        mMode = mode;
    }

    public CameraUpdateItem toCameraUpdate(MapboxMap map) {
        CameraPosition currentCamera = map.getCameraPosition();
        CameraPosition.Builder builder = new CameraPosition.Builder(currentCamera);

        if (mBearing != null) {
            builder.bearing(mBearing);
        }

        if (mTilt != null) {
            builder.tilt(mTilt);
        }

        if (mLatLng != null) {
            builder.target(mLatLng);
        } else if (mBounds != null) {
            double tilt = mTilt != null ? mTilt : currentCamera.tilt;
            double bearing = mBearing != null ? mBearing : currentCamera.bearing;

            // Adding map padding to the camera padding which is the same behavior as
            // mapbox native does on iOS
            int[] mapPadding = map.getPadding();
            int paddingLeft = mapPadding[0] + mBoundsPaddingLeft;
            int paddingTop = mapPadding[1] + mBoundsPaddingTop;
            int paddingRight = mapPadding[2] + mBoundsPaddingRight;
            int paddingBottom = mapPadding[3] + mBoundsPaddingBottom;

            int[] cameraPadding = {paddingLeft, paddingTop, paddingRight, paddingBottom};
            CameraPosition boundsCamera = map.getCameraForLatLngBounds(mBounds, cameraPadding, bearing, tilt);
            if (boundsCamera != null) {
                builder.target(boundsCamera.target);
                builder.zoom(boundsCamera.zoom);
            } else {
                CameraUpdate update = CameraUpdateFactory.newLatLngBounds(mBounds, paddingLeft,
                        paddingTop, paddingRight, paddingBottom);
                return new CameraUpdateItem(map, update, mDuration, mCallback, mMode);
            }
        }

        if (mZoom != null) {
            builder.zoom(mZoom);
        }

        return new CameraUpdateItem(map, CameraUpdateFactory.newCameraPosition(builder.build()), mDuration, mCallback, mMode);
    }

    public static CameraStop fromReadableMap(Context context, @NonNull ReadableMap readableMap, MapboxMap.CancelableCallback callback) {
        CameraStop stop = new CameraStop();

        if (readableMap.hasKey("pitch")) {
            stop.setTilt(readableMap.getDouble("pitch"));
        }

        if (readableMap.hasKey("heading")) {
            stop.setBearing(readableMap.getDouble("heading"));
        }

        if (readableMap.hasKey("centerCoordinate")) {
            Point target = GeoJSONUtils.toPointGeometry(readableMap.getString("centerCoordinate"));
            stop.setLatLng(GeoJSONUtils.toLatLng(target));
        }

        if (readableMap.hasKey("zoom")) {
            stop.setZoom(readableMap.getDouble("zoom"));
        }

        if (readableMap.hasKey("duration")) {
            stop.setDuration(readableMap.getInt("duration"));
        }

        if (readableMap.hasKey("bounds")) {
            int paddingTop = getBoundsPaddingByKey(readableMap, "boundsPaddingTop");
            int paddingRight = getBoundsPaddingByKey(readableMap, "boundsPaddingRight");
            int paddingBottom = getBoundsPaddingByKey(readableMap, "boundsPaddingBottom");
            int paddingLeft = getBoundsPaddingByKey(readableMap, "boundsPaddingLeft");

            // scale padding by pixel ratio
            DisplayMetrics metrics = context.getResources().getDisplayMetrics();
            paddingTop = Float.valueOf(paddingTop * metrics.scaledDensity).intValue();
            paddingRight = Float.valueOf(paddingRight * metrics.scaledDensity).intValue();
            paddingBottom = Float.valueOf(paddingBottom * metrics.scaledDensity).intValue();
            paddingLeft = Float.valueOf(paddingLeft * metrics.scaledDensity).intValue();

            FeatureCollection collection = FeatureCollection.fromJson(readableMap.getString("bounds"));
            stop.setBounds(GeoJSONUtils.toLatLngBounds(collection), paddingLeft, paddingRight,
                    paddingTop, paddingBottom);
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

    private static int getBoundsPaddingByKey(ReadableMap map, String key) {
        return map.hasKey(key) ? map.getInt(key) : 0;
    }
}
