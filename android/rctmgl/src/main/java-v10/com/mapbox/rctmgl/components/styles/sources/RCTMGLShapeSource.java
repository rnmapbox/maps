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
import com.mapbox.maps.extension.style.sources.generated.GeoJsonSource;
import com.mapbox.maps.plugin.delegates.MapFeatureQueryDelegate;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.events.AndroidCallbackEvent;
import com.mapbox.rctmgl.events.FeatureClickEvent;
// import com.mapbox.rctmgl.utils.DownloadMapImageTask;
import com.mapbox.rctmgl.utils.ImageEntry;
import com.mapbox.rctmgl.utils.Logger;

import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class RCTMGLShapeSource extends RCTSource<GeoJsonSource> {
    private URL mURL;
    private RCTMGLShapeSourceManager mManager;

    private String mShape;

    private Boolean mCluster;
    private Integer mClusterRadius;
    private Integer mClusterMaxZoom;

    private Integer mMaxZoom;
    private Integer mBuffer;
    private Double mTolerance;
    private Boolean mLineMetrics;

    private static Bitmap mImagePlaceholder;
    private List<Map.Entry<String, ImageEntry>> mImages;
    private List<Map.Entry<String, BitmapDrawable>> mNativeImages;

    public RCTMGLShapeSource(Context context, RCTMGLShapeSourceManager manager) {
        super(context);
        mManager = manager;
    }

    @Override
    public void addToMap(final RCTMGLMapView mapView) {
        // Wait for style before adding the source to the map
        mapView.getMapboxMap().getStyle(new Style.OnStyleLoaded() {
            @Override
            public void onStyleLoaded(@NonNull Style style) {
                MapboxMap map = mapView.getMapboxMap();
                RCTMGLShapeSource.super.addToMap(mapView);
            }
        });
    }

    @Override
    public GeoJsonSource makeSource() {

        GeoJsonSource.Builder builder = new GeoJsonSource.Builder(mID, new OnGeoJsonParsed() {
            @Override
            public void onGeoJsonParsed(@NonNull GeoJsonSource geoJsonSource) {
                // v10TODO
            }
        });
        getOptions(builder);

        if (mShape != null) {
            builder.data(mShape);
        } else {
            builder.data(mURL.toString());
        }

        return builder.build();
    }

    public void setURL(URL url) {
        mURL = url;

        if (mSource != null && mMapView != null && !mMapView.isDestroyed() ) {
            mSource.data(mURL.toString());
        }
    }

    public void setShape(String geoJSONStr) {
        mShape = geoJSONStr;

        if (mSource != null && mMapView != null && !mMapView.isDestroyed() ) {
            mSource.data(mShape);

            Expected<String, None> result = mMap.getStyle().setStyleSourceProperty(mID, "data", Value.valueOf(mShape));

        }
    }

    public void setCluster(boolean cluster) {
        mCluster = cluster;
    }

    public void setClusterRadius(int clusterRadius) {
        mClusterRadius = clusterRadius;
    }

    public void setClusterMaxZoom(int clusterMaxZoom) {
        mClusterMaxZoom = clusterMaxZoom;
    }

    public void setMaxZoom(int maxZoom) {
        mMaxZoom = maxZoom;
    }

    public void setBuffer(int buffer) {
        mBuffer = buffer;
    }

    public void setTolerance(double tolerance) {
        mTolerance = tolerance;
    }

    public void setLineMetrics(boolean lineMetrics) {
        mLineMetrics = lineMetrics;
    }

    public void onPress(OnPressEvent event) {
        mManager.handleEvent(FeatureClickEvent.makeShapeSourceEvent(this, event));
    }

    private void getOptions(GeoJsonSource.Builder builder) {
        if (mCluster != null) {
            builder.cluster(mCluster);
        }

        if (mClusterRadius != null) {
            builder.clusterRadius(mClusterRadius);
        }

        if (mClusterMaxZoom != null) {
            builder.clusterMaxZoom(mClusterMaxZoom);
        }

        if (mMaxZoom != null) {
            builder.maxzoom(mMaxZoom);
        }

        if (mBuffer != null) {
            builder.buffer(mBuffer);
        }

        if (mTolerance != null) {
            builder.tolerance(mTolerance.floatValue());
        }

        if (mLineMetrics != null) {
            builder.lineMetrics(mLineMetrics);
        }
    }

    public void querySourceFeatures(String callbackID,
                                    @Nullable Expression filter) {
        if (mSource == null) {
            WritableMap payload = new WritableNativeMap();
            payload.putString("error", "source is not yet loaded");
            AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
            mManager.handleEvent(event);
            return;
        }

        RCTMGLShapeSource _this = this;
        mMap.querySourceFeatures(mID, new SourceQueryOptions(
                null, // v10todo
                filter
            ),new QueryFeaturesCallback() {

            @Override
            public void run(@NonNull Expected<String, List<QueriedFeature>> features) {
                if (features.isError()) {
                    Logger.e("RCTMGLShapeSource", String.format("Error: %s", features.getError()));
                } else {
                    WritableMap payload = new WritableNativeMap();

                    List<Feature> result = new ArrayList<>(features.getValue().size());
                    for (QueriedFeature i : features.getValue()) {
                        result.add(i.getFeature());
                    }

                    payload.putString("data", FeatureCollection.fromFeatures(result).toJson());

                    AndroidCallbackEvent event = new AndroidCallbackEvent(_this, callbackID, payload);
                    mManager.handleEvent(event);
                }
            }
        });
    }

    /*
    public void getClusterExpansionZoom(String callbackID, int clusterId) {
        if (mSource == null) {
            WritableMap payload = new WritableNativeMap();
            payload.putString("error", "source is not yet loaded");
            AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
            mManager.handleEvent(event);
            return;
        }
        List<Feature> features = mSource.querySourceFeatures(Expression.eq(Expression.id(), clusterId));
        int zoom = -1;
        if (features.size() > 0) {
            zoom = mSource.getClusterExpansionZoom(features.get(0));
        }

        if (zoom == -1) {
            WritableMap payload = new WritableNativeMap();
            payload.putString("error", "Could not get zoom for cluster id " + clusterId);
            AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
            mManager.handleEvent(event);
            return;
        }

        WritableMap payload = new WritableNativeMap();
        payload.putInt("data", zoom);

        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
        mManager.handleEvent(event);
    }

    public void getClusterLeaves(String callbackID, int clusterId, int number, int offset) {
        Feature clusterFeature = mSource.querySourceFeatures(Expression.eq(Expression.get("cluster_id"), clusterId)).get(0);
        FeatureCollection leaves = mSource.getClusterLeaves(clusterFeature, number, offset);
        WritableMap payload = new WritableNativeMap();
        payload.putString("data", leaves.toJson());

        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
        mManager.handleEvent(event);
    }*/
}
