package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;
import androidx.annotation.Nullable;
import androidx.annotation.Size;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.geojson.Feature;
import com.mapbox.geojson.FeatureCollection;
import com.mapbox.mapboxsdk.style.expressions.Expression;
import com.mapbox.mapboxsdk.style.sources.VectorSource;
import com.mapbox.rctmgl.events.AndroidCallbackEvent;
import com.mapbox.rctmgl.events.FeatureClickEvent;

import java.util.List;

/**
 * Created by nickitaliano on 9/8/17.
 */

public class RCTMGLVectorSource extends RCTMGLTileSource<VectorSource> {
    private RCTMGLVectorSourceManager mManager;

    public RCTMGLVectorSource(Context context, RCTMGLVectorSourceManager manager) {
        super(context);
        mManager = manager;
    }

    public void onPress(OnPressEvent event) {
        mManager.handleEvent(FeatureClickEvent.makeVectorSourceEvent(this, event));
    }

    @Override
    public VectorSource makeSource() {
        if (isDefaultSource(mID)) {
            return (VectorSource)mMap.getStyle().getSource(DEFAULT_ID);
        }

        String configurationUrl = getURL();
        if (configurationUrl != null) {
            return new VectorSource(mID, getURL());
        }
        return new VectorSource(mID, buildTileset());
    }

    public void querySourceFeatures(String callbackID,
                                             @Size(min = 1) List<String> layerIDs,
                                             @Nullable Expression filter) {
        if (mSource == null) {
            WritableMap payload = new WritableNativeMap();
            payload.putString("error", "source is not yet loaded");
            AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
            mManager.handleEvent(event);
            return;
        }
        List<Feature> features = mSource.querySourceFeatures(layerIDs.toArray(new String[layerIDs.size()]), filter);
        WritableMap payload = new WritableNativeMap();
        payload.putString("data", FeatureCollection.fromFeatures(features).toJson());

        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
        mManager.handleEvent(event);
    }
}
