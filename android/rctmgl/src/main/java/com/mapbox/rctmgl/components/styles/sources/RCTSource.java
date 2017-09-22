package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;
import android.util.SparseArray;
import android.view.View;

import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.style.sources.Source;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.styles.layers.RCTLayer;

/**
 * Created by nickitaliano on 9/7/17.
 */

public abstract class RCTSource<T extends Source> extends AbstractMapFeature {
    public static final String DEFAULT_ID = "composite";

    protected RCTMGLMapView mMapView;
    protected MapboxMap mMap;

    protected String mID;
    protected Source mSource;

    protected SparseArray<RCTLayer> mLayers;
    private SparseArray<RCTLayer> mQueuedLayers;

    public RCTSource(Context context) {
        super(context);
        mLayers = new SparseArray<>();
        mQueuedLayers = new SparseArray<>();
    }

    public void setID(String id) {
        mID = id;
    }

    public void setSource(Source source) {
        mSource = source;
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mMapView = mapView;
        mMap = mapView.getMapboxMap();

        if (mID.equals(DEFAULT_ID)) {
            mSource = mMap.getSource(DEFAULT_ID);
        } else {
            mSource = makeSource();
            mMap.addSource(mSource);
        }

        if (mQueuedLayers.size() > 0) {
            for (int i = 0; i < mQueuedLayers.size(); i++) {
                int childPosition = mQueuedLayers.keyAt(i);
                addLayerToMap(mQueuedLayers.get(childPosition), childPosition);
            }
            mQueuedLayers = null;
        }
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        mMap.removeSource(mSource);
    }

    @Override
    public void addView(View childView, int childPosition) {
        if (!(childView instanceof RCTLayer)) {
            return;
        }

        RCTLayer layer = (RCTLayer) childView;
        if (mMap == null) {
            mQueuedLayers.put(childPosition, layer);
        } else {
            addLayerToMap(layer, childPosition);
        }
    }

    protected void addLayerToMap(RCTLayer layer, int childPosition) {
        if (mMapView == null || layer == null) {
            return;
        }
        layer.addToMap(mMapView);
        mLayers.put(childPosition, layer);
    }

    public abstract T makeSource();

    public static boolean isDefaultSource(String sourceID) {
        return DEFAULT_ID.equals(sourceID);
    }
}
