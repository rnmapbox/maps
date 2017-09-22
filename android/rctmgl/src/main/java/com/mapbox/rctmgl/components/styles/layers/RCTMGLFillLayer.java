package com.mapbox.rctmgl.components.styles.layers;

import android.content.Context;

import com.mapbox.mapboxsdk.style.layers.FillLayer;
import com.mapbox.mapboxsdk.style.layers.Filter;
import com.mapbox.rctmgl.components.styles.RCTMGLStyle;
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory;

/**
 * Created by nickitaliano on 9/8/17.
 */

public class RCTMGLFillLayer extends RCTLayer<FillLayer> {
    public RCTMGLFillLayer(Context context) {
        super(context);
    }

    @Override
    public FillLayer makeLayer() {
        FillLayer layer = new FillLayer(mID, mSourceID);

        Filter.Statement statement = buildFilter();
        if (statement != null) {
            layer.setFilter(statement);
        }

        return layer;
    }

    @Override
    public void addStyles() {
        RCTMGLStyleFactory.setFillLayerStyle(mLayer, new RCTMGLStyle(mReactStyle, mMap));
    }
}
