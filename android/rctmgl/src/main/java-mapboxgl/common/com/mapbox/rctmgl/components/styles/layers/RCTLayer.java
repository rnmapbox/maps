package com.mapbox.rctmgl.components.styles.layers;

import android.content.Context;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.common.logging.FLog;
import com.mapbox.mapboxsdk.location.LocationComponentConstants;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.mapboxsdk.style.expressions.Expression;
import com.mapbox.mapboxsdk.style.layers.Layer;
import com.mapbox.mapboxsdk.style.layers.Property;
import com.mapbox.mapboxsdk.style.layers.PropertyFactory;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.utils.ExpressionParser;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by nickitaliano on 9/7/17.
 */

public abstract class RCTLayer<T extends Layer> extends AbstractMapFeature {
    public static final String LOG_TAG = "RCTLayer";

    protected String mID;
    protected String mSourceID;
    protected String mAboveLayerID;
    protected String mBelowLayerID;

    protected Integer mLayerIndex;
    protected boolean mVisible;
    protected Double mMinZoomLevel;
    protected Double mMaxZoomLevel;
    protected ReadableMap mReactStyle;
    protected Expression mFilter;

    protected MapboxMap mMap;
    protected T mLayer;

    protected Context mContext;
    protected RCTMGLMapView mMapView;

    protected boolean mHadFilter;

    public RCTLayer(Context context) {
        super(context);
        mContext = context;
        mHadFilter = false;
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
        Expression filterExpression = ExpressionParser.from(readableFilterArray);

        mFilter = filterExpression;

        if (mLayer != null) {
            if (mFilter != null) {
                mHadFilter = true;
                updateFilter(mFilter);
            } else if (mHadFilter) {
                updateFilter(Expression.literal(true));
            }
        }
    }

    public void add() {
        if (!hasInitialized()) {
            return;
        }
        if (getStyle() == null) return;

        String userBackgroundID = LocationComponentConstants.BACKGROUND_LAYER;
        Layer userLocationBackgroundLayer = getStyle().getLayer(userBackgroundID);

        // place below user location layer
        if (userLocationBackgroundLayer != null) {
            getStyle().addLayerBelow(mLayer, userBackgroundID);
            mMapView.layerAdded(mLayer);
            return;
        }

        getStyle().addLayer(mLayer);
        mMapView.layerAdded(mLayer);
    }

    public void addAbove(final String aboveLayerID) {
        mMapView.waitForLayer(aboveLayerID, new RCTMGLMapView.FoundLayerCallback() {
            public void found(Layer layer) {
                if (!hasInitialized()) {
                    return;
                }
                if (getStyle() == null) return;
                getStyle().addLayerAbove(mLayer, aboveLayerID);
                mMapView.layerAdded(mLayer);
            }
        });
    }

    public void addBelow(final String belowLayerID) {
        mMapView.waitForLayer(belowLayerID, new RCTMGLMapView.FoundLayerCallback() {
            public void found(Layer layer) {
                if (!hasInitialized()) {
                    return;
                }
                if (getStyle() == null) return;
                getStyle().addLayerBelow(mLayer, belowLayerID);
                mMapView.layerAdded(mLayer);
            }
        });
    }

    public void addAtIndex(int index) {
        if (!hasInitialized()) {
            return;
        }
        if (getStyle() == null) return;
        int layerSize = getStyle().getLayers().size();
        if (index >= layerSize) {
            FLog.e(LOG_TAG, "Layer index is greater than number of layers on map. Layer inserted at end of layer stack.");
            index = layerSize - 1;
        }
        getStyle().addLayerAt(mLayer, index);
        mMapView.layerAdded(mLayer);
    }

    protected void insertLayer() {
        if (getStyle() == null) return;
        if (getStyle().getLayer(mID) != null) {
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

    protected void updateFilter(Expression expression) {
        // override if you want to update the filter
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mMap = mapView.getMapboxMap();
        mMapView = mapView;

        if (getStyle() == null) return;

        T existingLayer = getStyle().<T>getLayerAs(mID);
        if (existingLayer != null) {
            mLayer = existingLayer;
        } else {
            mLayer = makeLayer();
            insertLayer();
        }

        addStyles();
        if (mFilter != null) {
            mHadFilter = true;
            updateFilter(mFilter);
        }
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        if (getStyle() != null) {
            getStyle().removeLayer(mLayer);
        }
    }

    private Style getStyle() {
        if (mMap == null) {
            return null;
        }
        return mMap.getStyle();
    }

    public abstract T makeLayer();
    public abstract void addStyles();

    private boolean hasInitialized() {
        return mMap != null && mLayer != null;
    }
}
