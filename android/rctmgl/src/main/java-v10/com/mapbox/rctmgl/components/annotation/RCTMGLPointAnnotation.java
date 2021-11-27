package com.mapbox.rctmgl.components.annotation;

import android.content.Context;
import android.graphics.PointF;
import android.graphics.Bitmap;
import android.view.View;
import androidx.annotation.NonNull;

import com.mapbox.geojson.Point;
import com.mapbox.maps.MapboxMap;
import com.mapbox.maps.ScreenCoordinate;
import com.mapbox.maps.Style;
import com.mapbox.maps.extension.style.layers.properties.generated.IconAnchor;
import com.mapbox.maps.plugin.annotation.generated.PointAnnotation;
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationManager;
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationOptions;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.events.PointAnnotationClickEvent;
import com.mapbox.rctmgl.events.PointAnnotationDragEvent;
import com.mapbox.rctmgl.events.constants.EventTypes;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.rctmgl.utils.BitmapUtils;
import com.mapbox.rctmgl.utils.LatLng;

import java.util.ArrayList;
import java.util.Arrays;

public class RCTMGLPointAnnotation extends AbstractMapFeature implements View.OnLayoutChangeListener {
    private Context mContext;
    private RCTMGLPointAnnotationManager mManager;
    private PointAnnotation mAnnotation;
    private MapboxMap mMap;
    private RCTMGLMapView mMapView;

    private boolean mHasChildren;

    private Point mCoordinate;

    private String mID;
    private String mTitle;
    private String mSnippet;

    private Float[] mAnchor;
    private boolean mIsSelected;
    private boolean mDraggable;

    private View mChildView;
    private Bitmap mChildBitmap;
    private String mChildBitmapId;

    private View mCalloutView;
    private PointAnnotation mCalloutSymbol;
    private Bitmap mCalloutBitmap;
    private String mCalloutBitmapId;

    private static final String MARKER_IMAGE_ID = "MARKER_IMAGE_ID";

    public RCTMGLPointAnnotation(Context context, RCTMGLPointAnnotationManager manager) {
        super(context);
        mContext = context;
        mManager = manager;
    }

    @Override
    public void addView(View childView, int childPosition) {
        if (childView instanceof RCTMGLCallout) {
            mCalloutView = childView;
        } else {
            mChildView = childView;
        }
        childView.addOnLayoutChangeListener(this);
        if (mMapView != null) {
            mMapView.offscreenAnnotationViewContainer().addView(childView);
        }
    }

    @Override
    public void removeView(View childView) {
        if (mChildView != null) {
            mMap.getStyle(new Style.OnStyleLoaded() {
                @Override
                public void onStyleLoaded(@NonNull Style style) {
                    style.removeStyleImage(mChildBitmapId);
                    mChildView = null;
                    mCalloutView = null;
                    mChildBitmap = null;
                    mChildBitmapId = null;
                    updateOptions();
                }
            });
        }
        if (mMapView != null) {
            mMapView.offscreenAnnotationViewContainer().removeView(childView);
        }
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mMapView = mapView;
        mMap = mapView.getMapboxMap();
        makeMarker();

        if (mChildView != null) {
            if (!mChildView.isAttachedToWindow()) {
                mMapView.offscreenAnnotationViewContainer().addView(mChildView);
            }
            addBitmapToStyle(mChildBitmap, mChildBitmapId);
            updateOptions();
        }
        if (mCalloutView != null) {
            if (!mCalloutView.isAttachedToWindow()) {
                mMapView.offscreenAnnotationViewContainer().addView(mCalloutView);
            }
            addBitmapToStyle(mCalloutBitmap, mCalloutBitmapId);
        }
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        RCTMGLMapView map = (mMapView != null) ? mMapView : mapView;
        if (map == null) {
            return;
        }

        if (mAnnotation != null) {
            map.getPointAnnotationManager().delete(mAnnotation);
        }
        if (mChildView != null) {
            map.offscreenAnnotationViewContainer().removeView(mChildView);
        }
        if (mCalloutView != null) {
            map.offscreenAnnotationViewContainer().removeView(mCalloutView);
        }
    }

    @Override
    public void onLayoutChange(View v, int left, int top, int right, int bottom, int oldLeft, int oldTop,
            int oldRight, int oldBottom) {
        if (left == 0 && top == 0 && right == 0 && bottom == 0) {
            return;
        }
        if (left != oldLeft || right != oldRight || top != oldTop || bottom != oldBottom) {
            refreshBitmap(v, left, top, right, bottom);
        }
    }

    private void refreshBitmap(View v, int left, int top, int right, int bottom) {
        Bitmap bitmap = BitmapUtils.viewToBitmap(v, left, top, right, bottom);
        String bitmapId = Integer.toString(v.getId());
        addBitmapToStyle(bitmap, bitmapId);
        if (v instanceof RCTMGLCallout) {
            mCalloutBitmap = bitmap;
            mCalloutBitmapId = bitmapId;
        } else {
            if (bitmap != null) {
                mChildBitmap = bitmap;
                mChildBitmapId = bitmapId;
                updateOptions();
            }
        }
    }

    private void refreshBitmap(View v) {
        refreshBitmap(v, v.getLeft(), v.getTop(), v.getRight(), v.getBottom());
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

    public View getCalloutView() {
        return mCalloutView;
    }

    public void setCoordinate(Point point) {
        mCoordinate = point;

        if (mAnnotation != null) {
            mAnnotation.setPoint(point);
            mMapView.getPointAnnotationManager().update(mAnnotation);
        }
        if (mCalloutSymbol != null) {

            mCalloutSymbol.setPoint(point);
            mMapView.getPointAnnotationManager().update(mCalloutSymbol);
        }
    }

    public void setAnchor(float x, float y) {
        mAnchor = new Float[]{x, y};

        if (mAnnotation != null) {
            updateAnchor();
            mMapView.getPointAnnotationManager().update(mAnnotation);
        }
    }

    public void setDraggable(Boolean draggable) {
        mDraggable = draggable;
        if (mAnnotation != null) {
            mAnnotation.setDraggable(draggable);
            mMapView.getPointAnnotationManager().update(mAnnotation);
        }
    }

    public PointAnnotation getMarker() {
        return mAnnotation;
    }

    public void onSelect(boolean shouldSendEvent) {
        if (mCalloutView != null) {
            makeCallout();
        }
        if (shouldSendEvent) {
            mManager.handleEvent(makeEvent(true));
        }
    }

    public void onDeselect() {
        mManager.handleEvent(makeEvent(false));
        if (mCalloutSymbol != null) {
            mMapView.getPointAnnotationManager().delete(mCalloutSymbol);
        }
    }

    public void onDragStart() {
        mCoordinate = mAnnotation.getPoint();
        mManager.handleEvent(makeDragEvent(EventTypes.ANNOTATION_DRAG_START));
    }

    public void onDrag() {
        mCoordinate = mAnnotation.getPoint();
        mManager.handleEvent(makeDragEvent(EventTypes.ANNOTATION_DRAG));
    }

    public void onDragEnd() {
        mCoordinate = mAnnotation.getPoint();
        mManager.handleEvent(makeDragEvent(EventTypes.ANNOTATION_DRAG_END));
    }

    public void makeMarker() {
        PointAnnotationOptions options = new PointAnnotationOptions()
            .withPoint(mCoordinate)
            .withDraggable(mDraggable)
            .withIconSize(1.0f)
            .withSymbolSortKey(10.0f);
        PointAnnotationManager symbolManager = mMapView.getPointAnnotationManager();
        if (symbolManager != null) {
            mAnnotation = symbolManager.create(options);
            updateOptions();
        }
    }

    private void updateOptions() {
        if (mAnnotation != null) {
            updateIconImage();
            updateAnchor();
            mMapView.getPointAnnotationManager().update(mAnnotation);
        }
    }

    private void updateIconImage() {
        if (mChildView != null) {
            if (mChildBitmapId != null) {
                mAnnotation.setIconImage(mChildBitmapId);
            }
        } else {
            mAnnotation.setIconImage(MARKER_IMAGE_ID);
            mAnnotation.setIconAnchor(IconAnchor.BOTTOM);
        }
    }

    private void updateAnchor() {
        if (mAnchor != null && mChildView != null && mChildBitmap != null) {
            int w = mChildBitmap.getWidth();
            int h = mChildBitmap.getHeight();
            final float scale = getResources().getDisplayMetrics().density;
            w = (int) (w / scale);
            h = (int) (h / scale);
            mAnnotation.setIconAnchor(IconAnchor.TOP_LEFT);
            mAnnotation.setIconOffset(
                    Arrays.asList((double)w * mAnchor[0] * -1.0, (double)h * mAnchor[1] * -1.0)
            );
        }
    }

    private void makeCallout() {
        float yOffset = -28f;
        if (mChildView != null) {
            if (mChildBitmap != null) {
                float scale = getResources().getDisplayMetrics().density;
                int h = (int) mChildBitmap.getHeight() / 2;
                h = (int) (h / scale);
                yOffset = (float) h * -1;
            }
        }
        PointAnnotationOptions options = new PointAnnotationOptions()
            .withPoint(mCoordinate)
            .withIconImage(mCalloutBitmapId)
            .withIconSize(1.0f)
            .withIconAnchor(IconAnchor.BOTTOM)
            .withIconOffset(Arrays.asList((double)0.0, (double)yOffset))
            .withSymbolSortKey(11.0f)
            .withDraggable(false);
        PointAnnotationManager symbolManager = mMapView.getPointAnnotationManager();
        if (symbolManager != null) {
            mCalloutSymbol = symbolManager.create(options);
        }
    }

    private void addBitmapToStyle(final Bitmap bitmap, final String bitmapId) {
        if (mMap != null && bitmapId != null && bitmap != null) {
            mMap.getStyle(new Style.OnStyleLoaded() {
                @Override
                public void onStyleLoaded(@NonNull Style style) {
                    style.addImage(bitmapId, bitmap);
                }
            });
        }
    }

    private PointAnnotationClickEvent makeEvent(boolean isSelect) {
        String type = isSelect ? EventTypes.ANNOTATION_SELECTED : EventTypes.ANNOTATION_DESELECTED;
        LatLng latLng = GeoJSONUtils.toLatLng(mCoordinate);
        PointF screenPos = getScreenPosition(latLng);
        return new PointAnnotationClickEvent(this, latLng, new ScreenCoordinate(screenPos.x, screenPos.y), type);
    }

    private PointAnnotationDragEvent makeDragEvent(String type) {
        LatLng latLng = GeoJSONUtils.toLatLng(mCoordinate);
        PointF screenPos = getScreenPosition(latLng);
        return new PointAnnotationDragEvent(this, latLng, screenPos, type);
    }

    private float getDisplayDensity() {
        return mContext.getResources().getDisplayMetrics().density;
    }

    private PointF getScreenPosition(LatLng latLng) {
        ScreenCoordinate screenPos = mMap.pixelForCoordinate(latLng.getPoint());
        float density = getDisplayDensity();
        return new PointF((float)(screenPos.getX() / density), (float)(screenPos.getY() / density));
    }

    public void refresh() {
        if (mChildView != null) {
            refreshBitmap(mChildView);
        }
    }
}
