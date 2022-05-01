package com.mapbox.rctmgl.components.camera;

import android.animation.Animator;
import android.content.Context;
import androidx.annotation.NonNull;
import android.util.DisplayMetrics;

import com.facebook.react.bridge.ReadableMap;
import com.mapbox.geojson.FeatureCollection;
import com.mapbox.geojson.Point;
/*
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;
import com.mapbox.mapboxsdk.maps.MapboxMap;
 */
import com.mapbox.maps.CameraOptions;
import com.mapbox.maps.CameraState;
import com.mapbox.maps.EdgeInsets;
import com.mapbox.maps.MapboxMap;
import com.mapbox.rctmgl.components.camera.constants.CameraMode;
import com.mapbox.rctmgl.utils.GeoJSONUtils;

import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.utils.LatLng;
import com.mapbox.rctmgl.utils.LatLngBounds;

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
    private Animator.AnimatorListener mCallback;

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

    public void setCallback(Animator.AnimatorListener callback) {
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

    public EdgeInsets convert(int value[]) {
        return new EdgeInsets(value[0], value[1], value[2], value[3]);
    }

    public CameraUpdateItem toCameraUpdate(RCTMGLMapView mapView) {
        MapboxMap map = mapView.getMapboxMap();
        CameraState currentCamera = map.getCameraState();
        CameraOptions.Builder builder = new CameraOptions.Builder();
        builder.center(currentCamera.getCenter());
        builder.bearing(currentCamera.getBearing());
        builder.padding(currentCamera.getPadding());
        builder.zoom(currentCamera.getZoom());

        if (mBearing != null) {
            builder.bearing(mBearing);
        }

        if (mTilt != null) {
            builder.pitch(mTilt);
        }

        if (mLatLng != null) {
            builder.center(mLatLng.getPoint());
        } else if (mBounds != null) {
            double tilt = mTilt != null ? mTilt : currentCamera.getPitch();
            double bearing = mBearing != null ? mBearing : currentCamera.getBearing();

            // Adding map padding to the camera padding which is the same behavior as
            // mapbox native does on iOS
            EdgeInsets contentInset = map.getCameraState().getPadding();

            int paddingLeft = Double.valueOf(contentInset.getLeft() + mBoundsPaddingLeft).intValue();
            int paddingTop = Double.valueOf(contentInset.getTop() + mBoundsPaddingTop).intValue();
            int paddingRight = Double.valueOf(contentInset.getRight() + mBoundsPaddingRight).intValue();
            int paddingBottom = Double.valueOf(contentInset.getBottom() + mBoundsPaddingBottom).intValue();

            int[] cameraPadding = {paddingLeft, paddingTop, paddingRight, paddingBottom};
            int[] cameraPaddingClipped = clippedPadding(cameraPadding, mapView);

            CameraOptions boundsCamera = map.cameraForCoordinateBounds(
                    mBounds.toBounds(),
                    convert(cameraPaddingClipped),
                    bearing,
                    mTilt
            );
            if (boundsCamera != null) {
                builder.center(boundsCamera.getCenter());
                builder.anchor(boundsCamera.getAnchor());
                builder.zoom(boundsCamera.getZoom());
                builder.padding(boundsCamera.getPadding());
            } else {
                /*
                CameraUpdate update = CameraUpdateFactory.newLatLngBounds(
                        mBounds,
                        cameraPaddingClipped[0],
                        cameraPaddingClipped[1],
                        cameraPaddingClipped[2],
                        cameraPaddingClipped[3]
                );*/
                CameraOptions update =
                        map.cameraForCoordinateBounds(mBounds.toBounds(),convert(cameraPaddingClipped),null, null);
                        ;
                return new CameraUpdateItem(map, update, mDuration, mCallback, mMode);
            }
        }

        if (mZoom != null) {
            builder.zoom(mZoom);
        }

        return new CameraUpdateItem(map, builder.build(), mDuration, mCallback, mMode);
    }

    public static CameraStop fromReadableMap(Context context, @NonNull ReadableMap readableMap, Animator.AnimatorListener callback) {
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
            /* v10todo
            stop.setBounds(GeoJSONUtils.toLatLngBounds(collection), paddingLeft, paddingRight,
                    paddingTop, paddingBottom); */
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

    private static int getBoundsPaddingByKey(ReadableMap map, String key) {
        return map.hasKey(key) ? map.getInt(key) : 0;
    }
}
