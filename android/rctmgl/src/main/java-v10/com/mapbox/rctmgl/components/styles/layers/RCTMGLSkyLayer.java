package com.mapbox.rctmgl.components.styles.layers;

import android.content.Context;

import com.mapbox.maps.extension.style.expressions.generated.Expression;
import com.mapbox.maps.extension.style.layers.generated.SkyLayer;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.styles.RCTMGLStyle;
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory;
import com.mapbox.rctmgl.utils.Logger;

public class RCTMGLSkyLayer extends RCTLayer<SkyLayer> {
    private String mSourceLayerID;

    public RCTMGLSkyLayer(Context context) {
        super(context);
    }

    @Override
    protected void updateFilter(Expression expression) {
        mLayer.filter(expression);
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        super.addToMap(mapView);
    }

    @Override
    public SkyLayer makeLayer() {
        SkyLayer layer = new SkyLayer(mID);

        return layer;
    }

    @Override
    public void addStyles() {
        RCTMGLStyleFactory.setSkyLayerStyle(mLayer, new RCTMGLStyle(getContext(), mReactStyle, mMap));
    }

    public void setSourceLayerID(String sourceLayerID) {
        Logger.e("RCTMGLSkyLayer", "Source layer should not be set for source layer id");
    }
}
