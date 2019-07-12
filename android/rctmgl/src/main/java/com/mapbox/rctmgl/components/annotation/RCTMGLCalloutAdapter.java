package com.mapbox.rctmgl.components.annotation;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import android.view.View;
import android.view.ViewGroup;

import com.mapbox.mapboxsdk.annotations.Marker;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;

/**
 * Created by nickitaliano on 10/11/17.
 */

public class RCTMGLCalloutAdapter implements MapboxMap.InfoWindowAdapter {
    private RCTMGLMapView mMapView;

    public RCTMGLCalloutAdapter(RCTMGLMapView mapView) {
        mMapView = mapView;
    }

    @Nullable
    @Override
    public View getInfoWindow(@NonNull Marker marker) {
        if (mMapView == null) {
            return null;
        }

        RCTMGLPointAnnotation annotation = mMapView.getPointAnnotationByMarkerID(marker.getId());
        if (annotation == null) {
            return null;
        }

        RCTMGLCallout calloutView = annotation.getCalloutView();
        if (calloutView == null) {
            return null;
        }

        if (calloutView.getLayoutParams() == null) {
            calloutView.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT));
        }

        return calloutView;
    }
}
