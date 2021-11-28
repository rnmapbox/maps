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
import com.mapbox.maps.FeatureExtensionValue;
import com.mapbox.maps.MapboxMap;
import com.mapbox.maps.QueriedFeature;
import com.mapbox.maps.QueryFeatureExtensionCallback;
import com.mapbox.maps.QueryFeaturesCallback;
import com.mapbox.maps.SourceQueryOptions;
import com.mapbox.maps.Style;

import com.mapbox.maps.extension.style.expressions.generated.Expression;
// import com.mapbox.rctmgl.R;
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

        GeoJsonSource.Builder builder = new GeoJsonSource.Builder(mID);
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

    private void callbackError(String callbackID, String error, String where) {
        WritableMap payload = new WritableNativeMap();
        payload.putString("error",where + ": " + error);
        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
        mManager.handleEvent(event);
    }

    public void getClusterExpansionZoom(String callbackID, int clusterId) {
        if (mSource == null) {
            WritableMap payload = new WritableNativeMap();
            payload.putString("error", "source is not yet loaded");
            AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
            mManager.handleEvent(event);
            return;
        }

        SourceQueryOptions options = new SourceQueryOptions(null,
            Expression.eq(Expression.get("cluster_id"), Expression.literal(clusterId))
        );

        RCTMGLShapeSource _this = this;

        mMap.querySourceFeatures(
            getID(),
            options,

            new QueryFeaturesCallback() {
                @Override
                public void run(@NonNull Expected<String, List<QueriedFeature>> features) {
                    if (features.isValue()) {
                        QueriedFeature cluster = features.getValue().get(0);
                        mMap.queryFeatureExtensions(getID(),
                                cluster.getFeature(),
                                "supercluster",
                                "expansion-zoom",
                                null,
                                new QueryFeatureExtensionCallback() {
                                    @Override
                                    public void run(@NonNull Expected<String, FeatureExtensionValue> extension) {
                                        if (extension.isValue()) {
                                            Object contents = extension.getValue().getValue().getContents();
                                            if (contents instanceof Long) {
                                                WritableMap payload = new WritableNativeMap();
                                                payload.putInt("data", ((Long)contents).intValue());

                                                AndroidCallbackEvent event = new AndroidCallbackEvent(_this, callbackID, payload);
                                                mManager.handleEvent(event);
                                                return;
                                            } else {
                                                callbackError(callbackID, "Not a number", "getClusterExpansionZoom/queryFeatureExtensions2");
                                                return;
                                            }
                                        } else {
                                            callbackError(callbackID, extension.getError(), "getClusterExpansionZoom/queryFeatureExtensions");
                                            return;
                                        }
                                    }
                                }
                        );
                    } else {
                        callbackError(callbackID, features.getError(), "getClusterExpansionZoom/querySourceFeatures");
                        return;
                    }
                }
            }
        );
    }


    public void getClusterLeaves(String callbackID, int clusterId, int number, int offset) {
        SourceQueryOptions options = new SourceQueryOptions(null,
                Expression.eq(Expression.get("cluster_id"), Expression.literal(clusterId))
        );
        mMap.querySourceFeatures(
            getID(),
            options, new QueryFeaturesCallback() {
                @Override
                public void run(@NonNull Expected<String, List<QueriedFeature>> features) {
                    if (features.isValue()) {
                        QueriedFeature cluster = features.getValue().get(0);
                        mMap.queryFeatureExtensions(getID(), cluster.getFeature(), "supercluster", "leaves", null,
                                new QueryFeatureExtensionCallback() {
                                    @Override
                                    public void run(@NonNull Expected<String, FeatureExtensionValue> extension) {
                                        if (extension.isValue()) {
                                            List<Feature> leaves = extension.getValue().getFeatureCollection();
                                            WritableMap payload = new WritableNativeMap();
                                            payload.putString("data", FeatureCollection.fromFeatures(leaves).toJson());
                                        } else {
                                            callbackError(callbackID, features.getError(), "getClusterLeaves/queryFeatureExtensions");
                                            return;
                                        }
                                    }
                                }
                        );
                    } else {
                        callbackError(callbackID, features.getError(), "getClusterLeaves/querySourceFeatures");
                        return;
                    }
                }
            }
        );
    }
}

