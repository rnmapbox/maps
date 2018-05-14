package com.mapbox.rctmgl.components.styles.layers;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;

import com.facebook.react.views.view.ReactViewGroup;
import com.mapbox.mapboxsdk.style.layers.Filter;
import com.mapbox.mapboxsdk.style.layers.PropertyFactory;
import com.mapbox.mapboxsdk.style.layers.SymbolLayer;
import com.mapbox.rctmgl.R;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.styles.RCTMGLStyle;
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory;

/**
 * Created by nickitaliano on 9/19/17.
 */

public class RCTMGLSymbolLayer extends RCTLayer<SymbolLayer> {
    private String mSourceLayerID;

    public RCTMGLSymbolLayer(Context context) {
        super(context);
    }

    @Override
    protected void updateFilter(Filter.Statement statement) {
        mLayer.setFilter(statement);
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        super.addToMap(mapView);

        if (mFilter != null) {
            updateFilter(mFilter);
        }
    }

    @Override
    public SymbolLayer makeLayer() {
        SymbolLayer layer = new SymbolLayer(mID, mSourceID);

        if (mSourceLayerID != null) {
            layer.setSourceLayer(mSourceLayerID);
        }

        return layer;
    }

    @Override
    public void addStyles() {
        RCTMGLStyleFactory.setSymbolLayerStyle(mLayer, new RCTMGLStyle(getContext(), mReactStyle, mMap));
    }

    public void setSourceLayerID(String sourceLayerID) {
        mSourceLayerID = sourceLayerID;

        if (mLayer != null) {
            mLayer.setSourceLayer(sourceLayerID);
        }
    }
}
