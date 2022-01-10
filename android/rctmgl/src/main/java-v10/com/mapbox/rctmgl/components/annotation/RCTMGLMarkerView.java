package com.mapbox.rctmgl.components.annotation;

import android.content.Context;
import android.graphics.PointF;
import android.view.View;

import androidx.annotation.NonNull;

import com.mapbox.bindgen.Expected;
import com.mapbox.bindgen.None;
import com.mapbox.geojson.Geometry;
import com.mapbox.geojson.Point;
import com.mapbox.maps.MapboxMap;
import com.mapbox.maps.ViewAnnotationOptions;
import com.mapbox.maps.viewannotation.ViewAnnotationOptionsKtxKt;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.OnMapReadyCallback;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.utils.GeoJSONUtils;

public class RCTMGLMarkerView extends AbstractMapFeature implements /*MarkerView.OnPositionUpdateListener, */View.OnLayoutChangeListener {
    private RCTMGLMarkerViewManager mManager;
    private RCTMGLMapView mMapView;

    private View mChildView;

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

        if (mChildView != null) {
            ViewAnnotationOptions options = new ViewAnnotationOptions.Builder().
                    geometry(mCoordinate).
                    build();

            mMapView.getViewAnnotationManager().updateViewAnnotation(mChildView, options);
        }
    }

    public void setAnchor(float x, float y) {
        mAnchor = new Float[]{x, y};
        refresh();
    }

    public void refresh() {
        // this will cause position to be recalculated
        if (mChildView != null) {
            int width = mChildView.getWidth();
            int height = mChildView.getHeight();
            ViewAnnotationOptions options = new ViewAnnotationOptions.Builder().
                    geometry(mCoordinate).
                    width(width).
                    height(height).
                    offsetX((int)((mAnchor[0] - 0.5) * width)).
                    offsetY((int)((mAnchor[1] - 0.5) * height)).
                    build();

            mMapView.getViewAnnotationManager().updateViewAnnotation(mChildView, options);
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
                    if (mChildView != null) {
                        GeoJSONUtils.toLatLng(mCoordinate);

                        int width = mChildView.getWidth();
                        int height = mChildView.getHeight();

                        ViewAnnotationOptions options = new ViewAnnotationOptions.Builder().
                                geometry(mCoordinate).
                                width(width).
                                height(height).
                                offsetX((int)((mAnchor[0] - 0.5) * width)).
                                offsetY((int)((mAnchor[1] - 0.5) * height)).
                                build();

                        mChildView.addOnLayoutChangeListener(rctmglMarkerView);
                        if (mChildView.getLayoutParams() == null && !mChildView.isAttachedToWindow()) {
                            mMapView.offscreenAnnotationViewContainer().addView(mChildView);
                            mMapView.offscreenAnnotationViewContainer().removeView(mChildView);
                        }
                        mMapView.getViewAnnotationManager().addViewAnnotation(mChildView, options);
                    }
                }
            }
        );
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        if (mChildView != null) {
            mMapView.getViewAnnotationManager().removeViewAnnotation(mChildView);
            mChildView.removeOnLayoutChangeListener(this);
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

