package com.mapbox.rctmgl.components.styles.layers;

import android.content.Context;

import com.mapbox.maps.extension.style.expressions.generated.Expression;
import com.mapbox.maps.extension.style.layers.generated.LineLayer;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.styles.RCTMGLStyle;
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory;

public class RCTMGLLineLayer extends RCTLayer<LineLayer> {
    private String mSourceLayerID;

    public RCTMGLLineLayer(Context context) {
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
    public LineLayer makeLayer() {
        LineLayer layer = new LineLayer(mID, mSourceID);

        if (mSourceLayerID != null) {
            layer.sourceLayer(mSourceLayerID);
        }

        return layer;
    }

    @Override
    public void addStyles() {
        RCTMGLStyleFactory.setLineLayerStyle(mLayer, new RCTMGLStyle(getContext(), mReactStyle, mMap));
    }

    public void setSourceLayerID(String sourceLayerID) {
        mSourceLayerID = sourceLayerID;

        if (mLayer != null) {
            mLayer.sourceLayer(mSourceLayerID);
        }
    }
}
