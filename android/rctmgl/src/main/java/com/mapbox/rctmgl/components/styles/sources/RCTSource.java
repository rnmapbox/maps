package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;
import android.util.SparseArray;
import android.view.View;

import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.style.sources.Source;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.styles.layers.RCTLayer;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by nickitaliano on 9/7/17.
 */

public abstract class RCTSource<T extends Source> extends AbstractMapFeature {
    public static final String DEFAULT_ID = "composite";

    protected RCTMGLMapView mMapView;
    protected MapboxMap mMap;

    protected String mID;
    protected Source mSource;

    protected List<RCTLayer> mLayers;
    private SparseArray<RCTLayer> mQueuedLayers;

    public RCTSource(Context context) {
        super(context);
        mLayers = new ArrayList<>();
        mQueuedLayers = new SparseArray<>();
    }

    public void setID(String id) {
        mID = id;
    }

    public void setSource(Source source) {
        mSource = source;
    }

    public int getLayerCount () {
        return mLayers.size();
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mMapView = mapView;
        mMap = mapView.getMapboxMap();

        Source existingSource = mMap.getSource(mID);
        if (existingSource != null) {
            mSource = existingSource;
        } else {
            mSource = makeSource();
            mMap.addSource(mSource);
        }

        if (mQueuedLayers != null && mQueuedLayers.size() > 0) { // first load
            for (int i = 0; i < mQueuedLayers.size(); i++) {
                int childPosition = mQueuedLayers.keyAt(i);
                addLayerToMap(mQueuedLayers.get(childPosition), childPosition);
            }
            mQueuedLayers = null;
        } else if (mLayers.size() > 0) { // handles the case of switching style url, but keeping layers on map
            for (int i = 0; i < mLayers.size(); i++) {
                addLayerToMap(mLayers.get(i), i);
            }
        }
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        if (mLayers.size() > 0) {
            for (int i = 0; i < mLayers.size(); i++) {
                RCTLayer layer = mLayers.get(i);
                layer.removeFromMap(mMapView);
            }
        }
        mMap.removeSource(mSource);
    }

    public void addLayer(View childView, int childPosition) {
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

    public void removeLayer(int childPosition) {
        removeLayerFromMap(mLayers.get(childPosition), childPosition);
    }

    public RCTLayer getLayerAt(int childPosition) {
        return mLayers.get(childPosition);
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

    protected void removeLayerFromMap(RCTLayer layer, int childPosition) {
        if (mMapView == null || layer == null) {
            return;
        }
        layer.removeFromMap(mMapView);
        mLayers.remove(childPosition);
    }

    public abstract T makeSource();

    public static boolean isDefaultSource(String sourceID) {
        return DEFAULT_ID.equals(sourceID);
    }
}
