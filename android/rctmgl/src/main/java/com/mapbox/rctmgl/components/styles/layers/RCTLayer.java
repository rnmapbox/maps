package com.mapbox.rctmgl.components.styles.layers;

import android.content.Context;
import android.util.Log;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.style.layers.Filter;
import com.mapbox.mapboxsdk.style.layers.Layer;
import com.mapbox.mapboxsdk.style.layers.Property;
import com.mapbox.mapboxsdk.style.layers.PropertyFactory;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.styles.sources.RCTSource;
import com.mapbox.rctmgl.location.UserLocationLayerConstants;
import com.mapbox.rctmgl.utils.ConvertUtils;
import com.mapbox.rctmgl.utils.DownloadMapImageTask;
import com.mapbox.rctmgl.utils.FilterParser;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created by nickitaliano on 9/7/17.
 */

public abstract class RCTLayer<T extends Layer> extends AbstractMapFeature {
    public static final String LOG_TAG = RCTLayer.class.getSimpleName();

    public static final Set<String> FILTER_OPS = new HashSet<String>(Arrays.asList(
            "all",
            "any",
            "none",
            "in",
            "!in",
            "<=",
            "<",
            ">=",
            ">",
            "!=",
            "==",
            "has",
            "!has"
    ));

    public static final int COMPOUND_FILTER_ALL = 3;
    public static final int COMPOUND_FILTER_ANY = 2;
    public static final int COMPOUND_FILTER_NONE = 1;

    protected String mID;
    protected String mSourceID;
    protected String mAboveLayerID;
    protected String mBelowLayerID;

    protected Integer mLayerIndex;
    protected boolean mVisible;
    protected Double mMinZoomLevel;
    protected Double mMaxZoomLevel;
    protected ReadableMap mReactStyle;
    protected Filter.Statement mFilter;

    protected MapboxMap mMap;
    protected T mLayer;

    protected Context mContext;
    protected RCTMGLMapView mMapView;

    public RCTLayer(Context context) {
        super(context);
        mContext = context;
    }

    public String getID() {
        return mID;
    }

    public void setID(String id) {
        mID = id;
    }

    public void setSourceID(String sourceID) {
        mSourceID = sourceID;
    }

    public void setAboveLayerID(String aboveLayerID) {
        if (mAboveLayerID != null && mAboveLayerID.equals(aboveLayerID)) {
            return;
        }

        mAboveLayerID = aboveLayerID;
        if (mLayer != null) {
            removeFromMap(mMapView);
            addAbove(mAboveLayerID);
        }
    }

    public void setBelowLayerID(String belowLayerID) {
        if (mBelowLayerID != null && mBelowLayerID.equals(belowLayerID)) {
            return;
        }

        mBelowLayerID = belowLayerID;
        if (mLayer != null) {
            removeFromMap(mMapView);
            addBelow(mBelowLayerID);
        }
    }

    public void setLayerIndex(int layerIndex) {
        if (mLayerIndex != null && mLayerIndex == layerIndex) {
            return;
        }

        mLayerIndex = layerIndex;
        if (mLayer != null) {
            removeFromMap(mMapView);
            addAtIndex(mLayerIndex);
        }
    }

    public void setVisible(boolean visible) {
        mVisible = visible;

        if (mLayer != null) {
            String visibility = mVisible ? Property.VISIBLE : Property.NONE;
            mLayer.setProperties(PropertyFactory.visibility(visibility));
        }
    }

    public void setMinZoomLevel(double minZoomLevel) {
        mMinZoomLevel = minZoomLevel;

        if (mLayer != null) {
            mLayer.setMinZoom((float) minZoomLevel);
        }
    }

    public void setMaxZoomLevel(double maxZoomLevel) {
        mMaxZoomLevel = maxZoomLevel;

        if (mLayer != null) {
            mLayer.setMaxZoom((float) maxZoomLevel);
        }
    }

    public void setReactStyle(ReadableMap reactStyle) {
        mReactStyle = reactStyle;

        if (mLayer != null) {
            addStyles();
        }
    }

    public void setFilter(ReadableArray readableFilterArray) {
        FilterParser.FilterList filterList = FilterParser.getFilterList(readableFilterArray);

        mFilter = buildFilter(filterList);

        if (mLayer != null) {
            if (mFilter != null) {
                updateFilter(mFilter);
            }
        }
    }

    public void add() {
        if (!hasInitialized()) {
            return;
        }

        String userBackgroundID = UserLocationLayerConstants.BACKGROUND_LAYER_ID;
        Layer userLocationBackgroundLayer = mMap.getLayer(userBackgroundID);

        // place below user location layer
        if (userLocationBackgroundLayer != null) {
            mMap.addLayerBelow(mLayer, userBackgroundID);
            return;
        }

        mMap.addLayer(mLayer);
    }

    public void addAbove(String aboveLayerID) {
        if (!hasInitialized()) {
            return;
        }
        mMap.addLayerAbove(mLayer, aboveLayerID);
    }

    public void addBelow(String belowLayerID) {
        if (!hasInitialized()) {
            return;
        }
        mMap.addLayerBelow(mLayer, belowLayerID);
    }

    public void addAtIndex(int index) {
        if (!hasInitialized()) {
            return;
        }
        mMap.addLayerAt(mLayer, index);
    }

    protected void insertLayer() {
        if (mMap.getLayer(mID) != null) {
            return; // prevent adding a layer twice
        }

        if (mAboveLayerID != null) {
            addAbove(mAboveLayerID);
        } else if (mBelowLayerID != null) {
            addBelow(mBelowLayerID);
        } else if (mLayerIndex != null) {
            addAtIndex(mLayerIndex);
        } else {
            add();
        }

        setZoomBounds();
    }

    protected void setZoomBounds() {
        if (mMaxZoomLevel != null) {
            mLayer.setMaxZoom(mMaxZoomLevel.floatValue());
        }

        if (mMinZoomLevel != null) {
            mLayer.setMinZoom(mMinZoomLevel.floatValue());
        }
    }

    protected Filter.Statement buildFilter(FilterParser.FilterList filterList) {
        return FilterParser.parse(filterList);
    }

    protected void updateFilter(Filter.Statement statement) {
        // override if you want to update the filter
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mMap = mapView.getMapboxMap();
        mMapView = mapView;

        T existingLayer = mMap.<T>getLayerAs(mID);
        if (existingLayer != null) {
            mLayer = existingLayer;
        } else {
            mLayer = makeLayer();
            insertLayer();
        }

        addStyles();
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        mMap.removeLayer(mLayer);
    }

    public abstract T makeLayer();
    public abstract void addStyles();

    private boolean hasInitialized() {
        return mMap != null && mLayer != null;
    }
}
