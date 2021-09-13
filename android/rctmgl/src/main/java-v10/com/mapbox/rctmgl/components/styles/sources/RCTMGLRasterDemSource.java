package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.drawable.BitmapDrawable;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.Size;
import androidx.core.content.res.ResourcesCompat;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.bindgen.Expected;
import com.mapbox.bindgen.None;
import com.mapbox.bindgen.Value;
import com.mapbox.geojson.Feature;
import com.mapbox.geojson.FeatureCollection;
import com.mapbox.maps.MapboxMap;
import com.mapbox.maps.QueriedFeature;
import com.mapbox.maps.QueryFeaturesCallback;
import com.mapbox.maps.SourceQueryOptions;
import com.mapbox.maps.Style;

import com.mapbox.maps.extension.style.expressions.generated.Expression;
// import com.mapbox.rctmgl.R;
import com.mapbox.maps.extension.style.sources.OnGeoJsonParsed;
import com.mapbox.maps.extension.style.sources.SourceUtils;
import com.mapbox.maps.extension.style.sources.TileSet;
import com.mapbox.maps.extension.style.sources.generated.GeoJsonSource;
import com.mapbox.maps.extension.style.sources.generated.RasterDemSource;
import com.mapbox.maps.extension.style.sources.generated.Scheme;
import com.mapbox.maps.extension.style.sources.generated.VectorSource;
import com.mapbox.maps.plugin.delegates.MapFeatureQueryDelegate;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.events.AndroidCallbackEvent;
import com.mapbox.rctmgl.events.FeatureClickEvent;
// import com.mapbox.rctmgl.utils.DownloadMapImageTask;
import com.mapbox.rctmgl.utils.ImageEntry;
import com.mapbox.rctmgl.utils.Logger;

import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;


public class RCTMGLRasterDemSource extends RCTMGLTileSource<RasterDemSource> {
    private RCTMGLRasterDemSourceManager mManager;

    public RCTMGLRasterDemSource(Context context, RCTMGLRasterDemSourceManager manager) {
        super(context);
        mManager = manager;
    }

    public void onPress(OnPressEvent event) {
        mManager.handleEvent(FeatureClickEvent.makeVectorSourceEvent(this, event));
    }

    @Override
    public RasterDemSource makeSource() {
        if (isDefaultSource(mID)) {
            return (RasterDemSource)SourceUtils.getSource(mMap.getStyle(), DEFAULT_ID);
        }

        String configurationUrl = getURL();
        if (configurationUrl != null) {
            return new RasterDemSource(
                    new RasterDemSource.Builder(mID)
                            .url(getURL())
            );
        }
        return new RasterDemSource(
                new RasterDemSource.Builder(mID)
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
                mID,
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
