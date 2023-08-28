package com.mapbox.rctmgl.components.styles.layers;

import android.content.Context;

import com.mapbox.mapboxsdk.style.layers.BackgroundLayer;
import com.mapbox.rctmgl.components.styles.RCTMGLStyle;
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory;

/**
 * Created by nickitaliano on 9/25/17.
 */

public class RCTMGLBackgroundLayer extends RCTLayer<BackgroundLayer> {
    public RCTMGLBackgroundLayer(Context context) {
        super(context);
    }

    @Override
    public BackgroundLayer makeLayer() {
        return new BackgroundLayer(mID);
    }

    @Override
    public void addStyles() {
        RCTMGLStyleFactory.setBackgroundLayerStyle(mLayer, new RCTMGLStyle(getContext(), mReactStyle, mMap));
    }
}
