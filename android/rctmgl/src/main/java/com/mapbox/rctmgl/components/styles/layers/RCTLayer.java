package com.mapbox.rctmgl.components.styles.layers;

import android.content.Context;
import android.util.Log;

import com.facebook.react.bridge.ReadableMap;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.style.layers.Filter;
import com.mapbox.mapboxsdk.style.layers.Layer;
import com.mapbox.mapboxsdk.style.layers.Property;
import com.mapbox.mapboxsdk.style.layers.PropertyFactory;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.styles.sources.RCTSource;
import com.mapbox.rctmgl.utils.ConvertUtils;
import com.mapbox.rctmgl.utils.DownloadMapImageTask;

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
    protected List<String> mFilter;

    protected MapboxMap mMap;
    protected T mLayer;

    protected Context mContext;
    protected RCTMGLMapView mMapView;

    public RCTLayer(Context context) {
        super(context);
        mContext = context;
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
    }

    public void setFilter(String[] filter) {
        mFilter = Arrays.asList(filter);
    }

    public void add() {
        if (!hasInitialized()) {
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

    protected Filter.Statement buildFilter() {
        Filter.Statement completeStatement = null;

        int compound = 0;

        if (mFilter == null) {
            return null;
        }

        // we are going to be popping items of the list, we want to treat the react prop as immutable
        List<String> filterList = new ArrayList<>(mFilter);

        // no filter
        if (filterList.isEmpty()) {
            return null;
        }

        // peak ahead to see if this is a compound filter or not
        switch (filterList.get(0)) {
            case "all":
                compound = COMPOUND_FILTER_ALL;
                break;
            case "any":
                compound = COMPOUND_FILTER_ANY;
                break;
            case "none":
                compound = COMPOUND_FILTER_NONE;
                break;
        }

        List<Filter.Statement> compoundStatement = new ArrayList<>();

        if (compound > 0) {
            filterList.remove(0);
        }

        while (!filterList.isEmpty()) {

            int posPointer = 1;

            while (posPointer < filterList.size()) {
                if (FILTER_OPS.contains(filterList.get(posPointer))) {
                    break;
                }
                posPointer++;
            }

            // TODO: throw useful exceptions here when popping from list fails due to an invalid filter

            List<String> currentFilters = new ArrayList<>(filterList.subList(0, posPointer));
            filterList.removeAll(currentFilters);

            String op = currentFilters.remove(0);
            Filter.Statement statement = null;
            String key = currentFilters.remove(0);
            List<Object> values = getFilterValues(currentFilters);

            switch (op) {
                case "in":
                    statement = Filter.in(key, values);
                    break;
                case "!in":
                    statement = Filter.notIn(key, values);
                    break;
                case "<=":
                    statement = Filter.lte(key, values.get(0));
                    break;
                case "<":
                    statement = Filter.lt(key, values.get(0));
                    break;
                case ">=":
                    statement = Filter.gte(key, values.get(0));
                    break;
                case ">":
                    statement = Filter.gt(key, values.get(0));
                    break;
                case "!=":
                    statement = Filter.neq(key, values.get(0));
                    break;
                case "==":
                    statement = Filter.eq(key, values.get(0));
                    break;
                case "has":
                    statement = Filter.has(key);
                    break;
                case "!has":
                    statement = Filter.notHas(key);
                    break;
            }

            if (compound > 0) {
                compoundStatement.add(statement);
            } else {
                completeStatement = statement;
            }
        }

        if (compound > 0) {
            Filter.Statement[] statements = new Filter.Statement[compoundStatement.size()];
            compoundStatement.toArray(statements);

            switch (compound) {
                case COMPOUND_FILTER_ALL:
                    return Filter.all(statements);
                case COMPOUND_FILTER_ANY:
                    return Filter.any(statements);
                case COMPOUND_FILTER_NONE:
                    return Filter.none(statements);
            }
        }

        return completeStatement;
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mMap = mapView.getMapboxMap();
        mMapView = mapView;

        if (RCTSource.isDefaultSource(mSourceID)) {
            mLayer = mMap.<T>getLayerAs(mID);
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

    private List<Object> getFilterValues(List<String> filter) {
        List<Object> objects = new ArrayList<>();

        for (String value : filter) {
            objects.add(ConvertUtils.getObjectFromString(value));
        }

        return objects;
    }
}
