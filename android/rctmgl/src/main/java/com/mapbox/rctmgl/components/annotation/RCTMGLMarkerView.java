package com.mapbox.rctmgl.components.annotation;

import android.content.Context;
import android.view.View;

import androidx.annotation.NonNull;

import com.mapbox.geojson.Point;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;
import com.mapbox.mapboxsdk.plugins.markerview.MarkerView;
import com.mapbox.mapboxsdk.plugins.markerview.MarkerViewManager;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.utils.GeoJSONUtils;

public class RCTMGLMarkerView extends AbstractMapFeature {
    private RCTMGLMarkerViewManager mManager;
    private RCTMGLMapView mMapView;

    private View mChildView;


    private MarkerViewManager mMarkerViewManager;

    private MarkerView mMarkerView;
    private Point mCoordinate;


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

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mMapView = mapView;

        mMapView.getMapAsync(
            new OnMapReadyCallback() {
                @Override
                public void onMapReady(@NonNull MapboxMap mapboxMap) {
                    MarkerViewManager markerViewManager = new MarkerViewManager(mMapView, mapboxMap);
                    mMarkerViewManager = mMapView.getMakerViewManager(mapboxMap);

                    if (mChildView != null) {
                        mMarkerView = new MarkerView(GeoJSONUtils.toLatLng(mCoordinate), mChildView);
                        mMarkerViewManager.addMarker(mMarkerView);
                    }
                }
            }
        );
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        if (mMarkerView != null) {
            mMarkerViewManager.removeMarker(mMarkerView);
            mMarkerView = null;
            mMarkerViewManager = null;
        }
    }
}

