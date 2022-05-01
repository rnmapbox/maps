package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.Size;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.bindgen.Expected;
import com.mapbox.geojson.Feature;
import com.mapbox.geojson.FeatureCollection;

import com.mapbox.maps.QueriedFeature;
import com.mapbox.maps.QueryFeaturesCallback;
import com.mapbox.maps.SourceQueryOptions;
import com.mapbox.maps.Style;
import com.mapbox.maps.StyleManagerInterface;
import com.mapbox.maps.StyleObjectInfo;
import com.mapbox.maps.extension.style.expressions.generated.Expression;
import com.mapbox.maps.extension.style.sources.Source;
import com.mapbox.maps.extension.style.sources.generated.VectorSource;
import com.mapbox.maps.extension.style.sources.SourceUtils;

import com.mapbox.maps.plugin.delegates.MapFeatureQueryDelegate;
import com.mapbox.rctmgl.events.AndroidCallbackEvent;
import com.mapbox.rctmgl.events.FeatureClickEvent;

import java.util.LinkedList;
import java.util.List;
import java.util.ListIterator;

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
        if (isDefaultSource(getID())) {
            return (VectorSource)SourceUtils.getSource(mMap.getStyle(), DEFAULT_ID);
        }

        String configurationUrl = getURL();
        if (configurationUrl != null) {
            return new VectorSource(
                    new VectorSource.Builder(getID())
                            .url(getURL())
            );
        }
        return new VectorSource(
                new VectorSource.Builder(getID())
                        .tileSet(buildTileset())
        );
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


        WritableMap payload = new WritableNativeMap();

        mMap.querySourceFeatures(
                getID(),
                new SourceQueryOptions(layerIDs, filter),

                new QueryFeaturesCallback() {
                    @Override
                    public void run(@NonNull Expected<String, List<QueriedFeature>> queriedFeatures) {
                        if (queriedFeatures.isError()) {
                            //V10todo
                            payload.putString("error", queriedFeatures.getError());
                        } else {
                            List<Feature> features = new LinkedList<>();
                            for (QueriedFeature feature: queriedFeatures.getValue()) {
                                features.add(feature.getFeature());
                            }
                            payload.putString("data", FeatureCollection.fromFeatures(features).toJson());
                        }
                    }
                }
        );

        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
        mManager.handleEvent(event);
    }
}
