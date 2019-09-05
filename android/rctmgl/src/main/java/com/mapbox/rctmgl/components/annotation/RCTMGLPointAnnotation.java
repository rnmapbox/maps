package com.mapbox.rctmgl.components.annotation;

import android.content.Context;
import android.graphics.PointF;
import android.graphics.Color;
import android.graphics.Canvas;
import android.graphics.Bitmap;
import android.view.MotionEvent;
import android.view.View;
import android.support.annotation.NonNull;
import android.util.Log;

import com.mapbox.geojson.Point;
import com.mapbox.mapboxsdk.annotations.Marker;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.maps.MapView;
import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.mapboxsdk.plugins.markerview.MarkerView;
import com.mapbox.mapboxsdk.plugins.annotation.Symbol;
import com.mapbox.mapboxsdk.plugins.annotation.SymbolOptions;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.utils.ColorUtils;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.events.PointAnnotationClickEvent;
import com.mapbox.rctmgl.events.constants.EventTypes;
import com.mapbox.rctmgl.utils.GeoJSONUtils;

import java.util.Arrays;
import java.util.List;

/**
 * Created by nickitaliano on 9/27/17.
 */

public class RCTMGLPointAnnotation extends AbstractMapFeature {
    private RCTMGLPointAnnotationManager mManager;
    private Symbol mAnnotation;
    private MapboxMap mMap;
    private RCTMGLMapView mMapView;

    private boolean mHasChildren;

    private Point mCoordinate;

    private String mID;
    private String mTitle;
    private String mSnippet;

    private Float[] mAnchor;
    private RCTMGLCallout mCallout;
    private boolean mIsSelected;
    private Bitmap mBitmap;
    private String mBitmapId;
    private View mChildView;

    private static final String MARKER_IMAGE_ID = "MARKER_IMAGE_ID";

    public RCTMGLPointAnnotation(Context context, RCTMGLPointAnnotationManager manager) {
        super(context);
        mManager = manager;
    }

    @Override
    public void addView(View childView, int childPosition) {
        mHasChildren = true;
        childView.addOnLayoutChangeListener(new OnLayoutChangeListener() {
            @Override
            public void onLayoutChange(View v, int left, int top, int right, int bottom, int oldLeft, int oldTop,
                    int oldRight, int oldBottom) {
                if (left != oldLeft || right != oldRight || top != oldTop || bottom != oldBottom) {
                    if (v != null) {
                        int w = v.getWidth();
                        int h = v.getHeight();
                        if (w <= 0 || h <= 0) {
                            throw new RuntimeException("Impossible to snapshot the view: view is invalid");
                        }
                        v.layout(0, 0, w, h);
                        Bitmap bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
                        bitmap.eraseColor(Color.TRANSPARENT);
                        Canvas canvas = new Canvas(bitmap);
                        v.draw(canvas);
                        mBitmap = bitmap;
                        mBitmapId = Integer.toString(v.getId());
                        if (mMap != null) {
                            mMap.getStyle(new Style.OnStyleLoaded() {
                                @Override
                                public void onStyleLoaded(@NonNull Style style) {
                                    style.addImage(mBitmapId, mBitmap);
                                    if (mAnnotation != null) {
                                        mAnnotation.setIconImage(mBitmapId);
                                    }
                                    if (mAnchor != null) {
                                        int w = mBitmap.getWidth();
                                        int h = mBitmap.getHeight();
                                        mAnnotation.setIconOffset(new PointF(w * mAnchor[0], h * mAnchor[1]));
                                    }
                                }
                            });
                        }
                    }
                }
            }
        });
    }

    @Override
    public void removeView(View childView) {
        if (mBitmapId != null) {
            mMap.getStyle(new Style.OnStyleLoaded() {
                @Override
                public void onStyleLoaded(@NonNull Style style) {
                    style.removeImage(mBitmapId);
                    mHasChildren = false;
                }
            });
        }
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mMapView = mapView;
        mMap = mapView.getMapboxMap();
        makeMarker();
        if (mBitmapId != null) {
            mMap.getStyle(new Style.OnStyleLoaded() {
                @Override
                public void onStyleLoaded(@NonNull Style style) {
                    style.addImage(mBitmapId, mBitmap);
                    if (mAnnotation != null) {
                        mAnnotation.setIconImage(mBitmapId);
                    }
                }
            });
        }
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        if (mAnnotation != null) {
            mMapView.getSymbolManager().delete(mAnnotation);
        }
    }

    public LatLng getLatLng() {
        return GeoJSONUtils.toLatLng(mCoordinate);
    }

    public long getMapboxID() {
        return mAnnotation == null ? -1 : mAnnotation.getId();
    }

    public String getID() {
        return mID;
    }

    public void setID(String id) {
        mID = id;
    }

    public RCTMGLCallout getCalloutView() {
        return mCallout;
    }

    public void setLatLng(Point point) {
        mCoordinate = point;

        if (mAnnotation != null) {
            mAnnotation.setLatLng(GeoJSONUtils.toLatLng(point));
        }
    }

    public void setAnchor(float x, float y) {
        mAnchor = new Float[]{x, y};

        if (mAnnotation != null && mBitmap != null) {
            int w = mBitmap.getWidth();
            int h = mBitmap.getHeight();
            mAnnotation.setIconOffset(new PointF(w * mAnchor[0], h * mAnchor[1]));
        }
    }

    public Symbol getMarker() {
        return mAnnotation;
    }

    public void onSelect(boolean shouldSendEvent) {
        if (shouldSendEvent) {
            mManager.handleEvent(makeEvent(true));
        }
    }

    public void onDeselect() {
        mManager.handleEvent(makeEvent(false));
    }

    public void onDragEnd() {
        mManager.handleEvent(makeEvent(false));
    }

    public void makeMarker() {
        mAnnotation = mMapView.getSymbolManager().create(buildOptions());
    }

    private SymbolOptions buildOptions() {
        SymbolOptions options = new SymbolOptions()
            .withLatLng(GeoJSONUtils.toLatLng(mCoordinate))
            .withIconSize(1.0f)
            .withSymbolSortKey(10.0f)
            .withDraggable(true);
        if (mAnchor != null && mBitmap != null) {
            int w = mBitmap.getWidth();
            int h = mBitmap.getHeight();
            options.withIconOffset(new Float[]{w * mAnchor[0], h * mAnchor[1]});
        }
        if (mHasChildren) {
            if (mBitmapId != null) {
                options.withIconImage(mBitmapId);
            }
        } else {
            options.withIconImage(MARKER_IMAGE_ID);
        }
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
}
