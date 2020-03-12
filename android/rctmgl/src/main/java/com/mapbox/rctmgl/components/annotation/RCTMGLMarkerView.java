package com.mapbox.rctmgl.components.annotation;

import android.content.Context;
import android.graphics.PointF;
import android.view.View;

import androidx.annotation.NonNull;

import com.mapbox.geojson.Point;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.utils.GeoJSONUtils;

public class RCTMGLMarkerView extends AbstractMapFeature implements MarkerView.OnPositionUpdateListener, View.OnLayoutChangeListener {
    private RCTMGLMarkerViewManager mManager;
    private RCTMGLMapView mMapView;

    private View mChildView;

    private MarkerViewManager mMarkerViewManager;

    private MarkerView mMarkerView;
    private Point mCoordinate;
    private Float[] mAnchor;


    public RCTMGLMarkerView(Context context, RCTMGLMarkerViewManager manager) {
        super(context);
        mManager = manager;
    }

    @Override
    public void addView(View childView, int childPosition) {
        mChildView = childView;
    }

    public void setCoordinate(Point point) {
        mCoordinate = point;

        if (mMarkerView != null) {
            mMarkerView.setLatLng(GeoJSONUtils.toLatLng(point));
        }
    }

    public void setAnchor(float x, float y) {
        mAnchor = new Float[]{x, y};
        refresh();
    }

    public void refresh() {
        // this will cause position to be recalculated
        if (mMarkerView != null) {
            mMarkerView.setLatLng(GeoJSONUtils.toLatLng(mCoordinate));
        }
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mMapView = mapView;

        final RCTMGLMarkerView rctmglMarkerView = this;

        mMapView.getMapAsync(
            new OnMapReadyCallback() {
                @Override
                public void onMapReady(@NonNull MapboxMap mapboxMap) {
                    mMarkerViewManager = mMapView.getMarkerViewManager(mapboxMap);

                    if (mChildView != null) {
                        mMarkerView = new MarkerView(GeoJSONUtils.toLatLng(mCoordinate), mChildView);
                        mMarkerView.setOnPositionUpdateListener(rctmglMarkerView);
                        mChildView.addOnLayoutChangeListener(rctmglMarkerView);
                        mMarkerViewManager.addMarker(mMarkerView);
                    }
                }
            }
        );
    }

    @Override
    public PointF onUpdate(PointF pointF) {
        if (mAnchor != null) {
            return new PointF(
                    pointF.x - mChildView.getWidth() * mAnchor[0],
                    pointF.y - mChildView.getHeight() * mAnchor[1]
                    );
        }
        return pointF;
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        if (mMarkerView != null) {
            mMarkerViewManager.removeMarker(mMarkerView);
            mChildView.removeOnLayoutChangeListener(this);
            mMarkerView.setOnPositionUpdateListener(null);
            mMarkerView = null;
            mMarkerViewManager = null;
        }
    }

    @Override
    public void onLayoutChange(View v, int left, int top, int right, int bottom, int oldLeft, int oldTop,
                               int oldRight, int oldBottom) {
        if (left != oldLeft || right != oldRight || top != oldTop || bottom != oldBottom) {
            refresh();
        }
    }
}

