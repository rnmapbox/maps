package com.mapbox.rctmgl.components.camera;

import android.content.Context;
import androidx.annotation.NonNull;
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

import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;

/**
 * Created by nickitaliano on 9/5/17.
 */

public class CameraStop {
    private Double mBearing;
    private Double mTilt;
    private Double mZoom;
    private LatLng mLatLng;

    private LatLngBounds mBounds;
    private int mPaddingLeft = 0;
    private int mPaddingRight = 0;
    private int mPaddingBottom = 0;
    private int mPaddingTop = 0;

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

    public void setBounds(LatLngBounds bounds) {
        mBounds = bounds;
    }

    public void setPadding(int paddingLeft, int paddingRight, int paddingTop, int paddingBottom) {
        mPaddingLeft = paddingLeft;
        mPaddingRight = paddingRight;
        mPaddingTop = paddingTop;
        mPaddingBottom = paddingBottom;
    }

    public void setMode(@CameraMode.Mode int mode) {
        mMode = mode;
    }

    public CameraUpdateItem toCameraUpdate(RCTMGLMapView mapView) {
        MapboxMap map = mapView.getMapboxMap();
        CameraPosition currentCamera = map.getCameraPosition();
        CameraPosition.Builder builder = new CameraPosition.Builder(currentCamera);

        // Adding map padding to the camera padding which is the same behavior as
        // mapbox native does on iOS
        double[] contentInset = mapView.getContentInset();

        int paddingLeft = Double.valueOf(contentInset[0] + mPaddingLeft).intValue();
        int paddingTop = Double.valueOf(contentInset[1] + mPaddingTop).intValue();
        int paddingRight = Double.valueOf(contentInset[2] + mPaddingRight).intValue();
        int paddingBottom = Double.valueOf(contentInset[3] + mPaddingBottom).intValue();

        int[] cameraPadding = {paddingLeft, paddingTop, paddingRight, paddingBottom};
        int[] cameraPaddingClipped = clippedPadding(cameraPadding, mapView);

        boolean hasSetZoom = false;

        if (mLatLng != null) {
            builder.target(mLatLng);
            builder.padding(
                cameraPaddingClipped[0],
                cameraPaddingClipped[1],
                cameraPaddingClipped[2],
                cameraPaddingClipped[3]
            );
        } else if (mBounds != null) {
            double tilt = mTilt != null ? mTilt : currentCamera.tilt;
            double bearing = mBearing != null ? mBearing : currentCamera.bearing;

            CameraPosition boundsCamera = map.getCameraForLatLngBounds(mBounds, cameraPaddingClipped, bearing, tilt);
            if (boundsCamera != null) {
                builder.target(boundsCamera.target);
                builder.zoom(boundsCamera.zoom);
                builder.padding(boundsCamera.padding);
            } else {
                CameraUpdate update = CameraUpdateFactory.newLatLngBounds(
                    mBounds,
                    cameraPaddingClipped[0],
                    cameraPaddingClipped[1],
                    cameraPaddingClipped[2],
                    cameraPaddingClipped[3]
                );
                return new CameraUpdateItem(map, update, mDuration, mCallback, mMode);
            }
            hasSetZoom = true;
        }

        if (mBearing != null) {
            builder.bearing(mBearing);
        }

        if (mTilt != null) {
            builder.tilt(mTilt);
        }

        if (mZoom != null && !hasSetZoom) {
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

        int paddingTop = getPaddingByKey(readableMap, "paddingTop");
        int paddingRight = getPaddingByKey(readableMap, "paddingRight");
        int paddingBottom = getPaddingByKey(readableMap, "paddingBottom");
        int paddingLeft = getPaddingByKey(readableMap, "paddingLeft");

        // scale padding by pixel ratio
        DisplayMetrics metrics = context.getResources().getDisplayMetrics();
        paddingTop = Float.valueOf(paddingTop * metrics.scaledDensity).intValue();
        paddingRight = Float.valueOf(paddingRight * metrics.scaledDensity).intValue();
        paddingBottom = Float.valueOf(paddingBottom * metrics.scaledDensity).intValue();
        paddingLeft = Float.valueOf(paddingLeft * metrics.scaledDensity).intValue();

        stop.setPadding(
                paddingLeft,
                paddingRight,
                paddingTop,
                paddingBottom
        );

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
            FeatureCollection collection = FeatureCollection.fromJson(readableMap.getString("bounds"));
            stop.setBounds(GeoJSONUtils.toLatLngBounds(collection));
        }

        if (readableMap.hasKey("mode")) {
            switch (readableMap.getInt("mode")) {
                case CameraMode.FLIGHT:
                    stop.setMode(CameraMode.FLIGHT);
                    break;
                case CameraMode.LINEAR:
                    stop.setMode(CameraMode.LINEAR);
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

    private static int[] clippedPadding(int[] padding, RCTMGLMapView mapView) {
        int mapHeight = mapView.getHeight();
        int mapWidth = mapView.getWidth();

        int left = padding[0];
        int top = padding[1];
        int right = padding[2];
        int bottom = padding[3];

        int resultLeft = left;
        int resultTop = top;
        int resultRight = right;
        int resultBottom = bottom;

        if (top + bottom >= mapHeight) {
            double totalPadding = top + bottom;
            double extra = totalPadding - mapHeight + 1.0; // add 1 to compensate for floating point math
            resultTop -= (top * extra) / totalPadding;
            resultBottom -= (bottom * extra) / totalPadding;
        }

        if (left + right >= mapWidth) {
            double totalPadding = left + right;
            double extra = totalPadding - mapWidth + 1.0; // add 1 to compensate for floating point math
            resultLeft -= (left * extra) / totalPadding;
            resultRight -= (right * extra) / totalPadding;
        }

        return new int[] {resultLeft, resultTop, resultRight, resultBottom};
    }

    private static int getPaddingByKey(ReadableMap map, String key) {
        return map.hasKey(key) ? map.getInt(key) : 0;
    }
}
