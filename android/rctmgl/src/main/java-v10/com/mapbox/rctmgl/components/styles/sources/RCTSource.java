package com.mapbox.rctmgl.components.styles.sources;

import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.styles.layers.RCTLayer;

import com.mapbox.rctmgl.utils.Logger;

import com.mapbox.maps.extension.style.sources.Source;
import com.mapbox.maps.MapboxMap;
import com.mapbox.maps.Style;
import com.mapbox.maps.extension.style.sources.SourceUtils;

import android.content.Context;

import androidx.annotation.NonNull;

import java.util.ArrayList;
import java.util.List;

public abstract class RCTSource<T extends Source> extends AbstractMapFeature {
    public static final String LOG_TAG = "RCTSource";

    protected RCTMGLMapView mMapView;
    protected MapboxMap mMap;

    protected String mID;
    protected T mSource;

    protected List<RCTLayer> mLayers;
    private List<RCTLayer> mQueuedLayers;

    public RCTSource(Context context) {
        super(context);
        mLayers = new ArrayList<>();
        mQueuedLayers = new ArrayList<>();
    }
    private T getSourceAs(Style style, String id) {
        Source result = SourceUtils.getSource(style, mID);

        try {
            return (T)result;
        } catch (ClassCastException exception) {
            return null;
        }
    }

    protected void addLayerToMap(RCTLayer layer, int childPosition) {
        if (mMapView == null || layer == null) {
            return;
        }

        layer.addToMap(mMapView);
        if (!mLayers.contains(layer)) {
            mLayers.add(childPosition, layer);
        }
    }

    public abstract T makeSource();

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mMapView = mapView;
        mMap = mapView.getMapboxMap();
        mMap.getStyle(new Style.OnStyleLoaded() {
            public void onStyleLoaded(@NonNull Style style) {
                T existingSource = getSourceAs(style, mID);
                if (existingSource != null) {
                    mSource = existingSource;
                } else {
                    mSource = makeSource();
                    SourceUtils.addSource(style, mSource);
                }

                if (mQueuedLayers != null && mQueuedLayers.size() > 0) { // first load
                    for (int i = 0; i < mQueuedLayers.size(); i++) {
                        addLayerToMap(mQueuedLayers.get(i), i);
                    }
                    mQueuedLayers = null;
                } else if (mLayers.size() > 0) { // handles the case of switching style url, but keeping layers on map
                    for (int i = 0; i < mLayers.size(); i++) {
                        addLayerToMap(mLayers.get(i), i);
                    }
                }
            }
        });


    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        if (mLayers.size() > 0) {
            for (int i = 0; i < mLayers.size(); i++) {
                RCTLayer layer = mLayers.get(i);
                layer.removeFromMap(mMapView);
            }
        }
        if (mQueuedLayers != null) {
            mQueuedLayers.clear();
        }
        if (mMap != null && mSource != null && mMap.getStyle() != null) {
            try {
                mMap.getStyle().removeStyleSource(mID);
            } catch (Throwable ex) {
                Logger.w(LOG_TAG, String.format("RCTSource.removeFromMap: %s - %s", mSource, ex.getMessage()), ex);
            }
        }
    }
}
