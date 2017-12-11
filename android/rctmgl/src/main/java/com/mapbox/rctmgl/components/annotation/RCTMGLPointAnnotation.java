package com.mapbox.rctmgl.components.annotation;

import android.content.Context;
import android.graphics.PointF;
import android.view.MotionEvent;
import android.view.View;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.mapbox.mapboxsdk.annotations.MarkerView;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.maps.MapView;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.events.PointAnnotationClickEvent;
import com.mapbox.rctmgl.events.constants.EventTypes;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.services.commons.geojson.Point;

import java.util.Arrays;
import java.util.List;

/**
 * Created by nickitaliano on 9/27/17.
 */

public class RCTMGLPointAnnotation extends AbstractMapFeature {
    private RCTMGLPointAnnotationManager mManager;
    private MarkerView mAnnotation;
    private MapboxMap mMap;
    private RCTMGLMapView mMapView;

    private boolean mHasChildren;

    private Point mCoordinate;

    private String mID;
    private String mTitle;
    private String mSnippet;

    private List<Float> mAnchor;
    private RCTMGLCallout mCallout;
    private boolean mIsSelected;

    public RCTMGLPointAnnotation(Context context, RCTMGLPointAnnotationManager manager) {
        super(context);
        mManager = manager;
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent event) {
        return false;
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        setMeasuredDimension(getWidth(), getHeight());
    }

    @Override
    public void addView(View childView, int childPosition) {
        if (childView instanceof RCTMGLCallout) {
            mCallout = (RCTMGLCallout) childView;
        } else {
            super.addView(childView, childPosition);
            mHasChildren = true;
        }
    }

    @Override
    public void removeView(View childView) {
        if (childView instanceof RCTMGLCallout) {
            mCallout = null;
        } else {
            super.removeView(childView);
            mHasChildren = false;
        }
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mMapView = mapView;
        mMap = mapView.getMapboxMap();
        makeMarker();
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        if (mAnnotation != null) {
            mMap.removeMarker(mAnnotation);
        }
    }

    public LatLng getLatLng() {
        return GeoJSONUtils.toLatLng(mCoordinate);
    }

    public long getMapboxID() {
        return mAnnotation == null ? -1 : mAnnotation.getId();
    }

    public String getID () {
        return mID;
    }

    public void setID(String id) {
        mID = id;
    }

    public RCTMGLCallout getCalloutView() {
        return mCallout;
    }

    public void setTitle(String title) {
        mTitle = title;

        if (mAnnotation != null) {
            mAnnotation.setTitle(mTitle);
        }
    }

    public void setSnippet(String snippet) {
        mSnippet = snippet;

        if (mAnnotation != null) {
            mAnnotation.setSnippet(snippet);
        }
    }

    public void setCoordinate(Point point) {
        mCoordinate = point;

        if (mAnnotation != null) {
            mAnnotation.setPosition(GeoJSONUtils.toLatLng(point));
        }
    }

    public void setAnchor(float x, float y) {
        mAnchor = Arrays.asList(x, y);

        if (mAnnotation != null) {
            mAnnotation.setAnchor(x, y);
        }
    }

    public void setReactSelected(boolean isSelected) {
        mIsSelected = isSelected;

        if (mAnnotation != null) {
            if (mIsSelected) {
                mMap.selectMarker(mAnnotation);
            } else {
                mMap.deselectMarker(mAnnotation);
            }
        }
    }

    public MarkerView getMarker() {
        return mAnnotation;
    }

    public RCTMGLCallout getCallout() {
        return mCallout;
    }

    public void onSelect(boolean shouldSendEvent) {
        if (shouldSendEvent) {
            mManager.handleEvent(makeEvent(true));
        }
    }

    public void onDeselect() {
        mManager.handleEvent(makeEvent(false));
    }

    public void makeMarker() {
        mAnnotation = mMap.addMarker(buildOptions());
        
        if (mAnchor != null && mAnchor.size() == 2) {
            mAnnotation.setAnchor(mAnchor.get(0), mAnchor.get(1));
        }

        final RCTMGLPointAnnotation self = this;
        if (mIsSelected) {
            mMapView.selectAnnotation(self);
        }
    }

    private RCTMGLPointAnnotationOptions buildOptions() {
        RCTMGLPointAnnotationOptions options = new RCTMGLPointAnnotationOptions();
        options.annotationID(mID);
        options.title(mTitle);
        options.snippet(mSnippet);
        options.hasChildren(mHasChildren);
        options.anchor(0.5f, 0.5f);
        options.position(GeoJSONUtils.toLatLng(mCoordinate));
        return options;
    }

    private PointAnnotationClickEvent makeEvent(boolean isSelect) {
        String type = isSelect ? EventTypes.ANNOTATION_SELECTED : EventTypes.ANNOTATION_DESELECTED;
        LatLng latLng = GeoJSONUtils.toLatLng(mCoordinate);
        PointF screenPos = getScreenPosition();
        return new PointAnnotationClickEvent(this, latLng, screenPos, type);
    }

    private PointF getScreenPosition() {
        int[] loc = new int[2];
        getLocationOnScreen(loc);
        return new PointF((float) loc[0], (float) loc[1]);
    }

    public static class CustomView extends MarkerView {
        private String mAnnotationID;
        private RCTMGLPointAnnotationOptions mOptions;

        public CustomView(String annotationID, RCTMGLPointAnnotationOptions options) {
            super(options);
            mOptions = options;
            mAnnotationID = annotationID;
        }

        public String getAnnotationID() {
            return mAnnotationID;
        }

        public boolean isDefaultIcon() {
            return !mOptions.getHasChildren();
        }
    }
}
