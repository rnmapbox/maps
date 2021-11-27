package com.mapbox.rctmgl.components.styles.sources;

import com.facebook.react.bridge.ReadableMap;
import com.mapbox.geojson.Feature;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.styles.layers.RCTLayer;

import com.mapbox.rctmgl.utils.LatLng;
import com.mapbox.rctmgl.utils.Logger;

import com.mapbox.maps.extension.style.sources.Source;
import com.mapbox.maps.MapboxMap;
import com.mapbox.maps.Style;
import com.mapbox.maps.extension.style.sources.SourceUtils;

import android.content.Context;
import android.graphics.PointF;
import android.view.View;

import androidx.annotation.NonNull;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class RCTSource<T extends Source> extends AbstractMapFeature {
    public static final String DEFAULT_ID = "composite";
    public static final String LOG_TAG = "RCTSource";

    protected RCTMGLMapView mMapView;
    protected MapboxMap mMap;

    protected String mID;
    protected T mSource;
    protected boolean mHasPressListener;
    protected Map<String, Double> mTouchHitbox;

    protected List<AbstractSourceConsumer> mLayers;
    private List<AbstractSourceConsumer> mQueuedLayers;

    public RCTSource(Context context) {
        super(context);
        mLayers = new ArrayList<>();
        mQueuedLayers = new ArrayList<>();
    }

    public String getID() {
        return mID;
    }
    
    private T getSourceAs(Style style, String id) {
        Source result = SourceUtils.getSource(style, mID);

        try {
            return (T)result;
        } catch (ClassCastException exception) {
            return null;
        }
    }

    protected void addLayerToMap(AbstractSourceConsumer layer, int childPosition) {
        if (mMapView == null || layer == null) {
            return;
        }

        layer.addToMap(mMapView);
        if (!mLayers.contains(layer)) {
            mLayers.add(childPosition, layer);
        }
    }

    public boolean hasPressListener() {
        return mHasPressListener;
    }

    public void setHasPressListener (boolean hasPressListener) {
        mHasPressListener = hasPressListener;
    }

    public void setHitbox(ReadableMap map) {
        Map<String, Double> hitbox = new HashMap<>();
        hitbox.put("width", map.getDouble("width"));
        hitbox.put("height", map.getDouble("height"));
        mTouchHitbox = hitbox;
    }

    public void setID(String id) {
        mID = id;
    }

    public int getLayerCount () {
        int totalCount = 0;

        if (mQueuedLayers != null) {
            totalCount = mQueuedLayers.size();
        }

        totalCount += mLayers.size();
        return totalCount;
    }

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
                AbstractSourceConsumer layer = mLayers.get(i);
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

    public void addLayer(View childView, int childPosition) {
        if (!(childView instanceof AbstractSourceConsumer)) {
            return;
        }

        AbstractSourceConsumer layer = (AbstractSourceConsumer) childView;
        if (mMap == null) {
            mQueuedLayers.add(childPosition, layer);
        } else {
            addLayerToMap(layer, childPosition);
        }
    }

    public void removeLayer(int childPosition) {
        AbstractSourceConsumer layer;
        if (mQueuedLayers != null && mQueuedLayers.size() > 0) {
            layer = mQueuedLayers.get(childPosition);
        } else {
            layer = mLayers.get(childPosition);
        }
        removeLayerFromMap(layer, childPosition);
    }

    public AbstractSourceConsumer getLayerAt(int childPosition) {
        if (mQueuedLayers != null && mQueuedLayers.size() > 0) {
            return mQueuedLayers.get(childPosition);
        }
        return mLayers.get(childPosition);
    }

    protected void removeLayerFromMap(AbstractSourceConsumer layer, int childPosition) {
        if (mMapView != null && layer != null) {
            layer.removeFromMap(mMapView);
        }
        if (mQueuedLayers != null && mQueuedLayers.size() > 0) {
            mQueuedLayers.remove(childPosition);
        } else {
            mLayers.remove(childPosition);
        }
    }

    public abstract T makeSource();

    static public class OnPressEvent {
        public List<Feature> features;
        public LatLng latLng;
        public PointF screenPoint;

        public OnPressEvent(@NonNull List<Feature> features, @NonNull LatLng latLng, @NonNull PointF screenPoint) {
            this.features = features;
            this.latLng = latLng;
            this.screenPoint = screenPoint;
        }
    }

    public abstract void onPress(OnPressEvent event);

    public static boolean isDefaultSource(String sourceID) {
        return DEFAULT_ID.equals(sourceID);
    }
}
