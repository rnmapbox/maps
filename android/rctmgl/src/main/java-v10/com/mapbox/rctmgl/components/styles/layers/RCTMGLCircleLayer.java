package com.mapbox.rctmgl.components.styles.layers;

import android.content.Context;

import com.mapbox.maps.extension.style.expressions.generated.Expression;
import com.mapbox.maps.extension.style.layers.generated.CircleLayer;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.styles.RCTMGLStyle;
import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory;
import com.mapbox.rctmgl.utils.Logger;
// import com.mapbox.rctmgl.components.styles.RCTMGLStyle;
// import com.mapbox.rctmgl.components.styles.RCTMGLStyleFactory;

public class RCTMGLCircleLayer extends RCTLayer<CircleLayer> {
    private String mSourceLayerID;

    public RCTMGLCircleLayer(Context context) {
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
    public CircleLayer makeLayer() {
        CircleLayer layer = new CircleLayer(mID, mSourceID);

        if (mSourceLayerID != null) {
            layer.sourceLayer(mSourceLayerID);

        }

        return layer;
    }

    @Override
    public void addStyles() {
        Logger.e("Foo", "bar");
        RCTMGLStyleFactory.setCircleLayerStyle(mLayer, new RCTMGLStyle(getContext(), mReactStyle, mMap));
    }

    public void setSourceLayerID(String sourceLayerID) {
        mSourceLayerID = sourceLayerID;

        if (mLayer != null) {
            mLayer.sourceLayer(sourceLayerID);
        }
    }
}
