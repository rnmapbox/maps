package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;
import android.graphics.PointF;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;

import com.facebook.react.bridge.ReadableMap;
import com.mapbox.mapboxsdk.annotations.Marker;
import com.mapbox.mapboxsdk.annotations.MarkerOptions;
import com.mapbox.mapboxsdk.annotations.MarkerView;
import com.mapbox.mapboxsdk.annotations.MarkerViewOptions;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.style.sources.GeoJsonOptions;
import com.mapbox.mapboxsdk.style.sources.GeoJsonSource;
import com.mapbox.rctmgl.components.annotation.RCTMGLCallout;
import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotationOptions;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.styles.layers.RCTLayer;
import com.mapbox.rctmgl.events.FeatureClickEvent;
import com.mapbox.rctmgl.events.IEvent;
import com.mapbox.rctmgl.utils.DownloadMapImageTask;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.services.commons.geojson.Feature;
import com.mapbox.services.commons.geojson.FeatureCollection;
import com.mapbox.services.commons.geojson.Geometry;
import com.mapbox.services.commons.geojson.Point;

import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by nickitaliano on 9/19/17.
 */

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

    private List<Map.Entry<String, String>> mImages;
    private List<Map.Entry<String, BitmapDrawable>> mNativeImages;

    public RCTMGLShapeSource(Context context, RCTMGLShapeSourceManager manager) {
        super(context);
        mManager = manager;
    }

    @Override
    public void addToMap(final RCTMGLMapView mapView) {
        if (!hasNativeImages() && !hasImages()) {
            super.addToMap(mapView);
            return;
        }

        MapboxMap map = mapView.getMapboxMap();

        // add all images from drawables folder
        if (hasNativeImages()) {
            for (Map.Entry<String, BitmapDrawable> nativeImage : mNativeImages) {
                map.addImage(nativeImage.getKey(),  nativeImage.getValue().getBitmap());
            }
        }

        // add all external images from javascript layer
        if (hasImages()) {
            DownloadMapImageTask.OnAllImagesLoaded imagesLoadedCallback = new DownloadMapImageTask.OnAllImagesLoaded() {
                @Override
                public void onAllImagesLoaded() {
                    RCTMGLShapeSource.super.addToMap(mapView);
                }
            };

            DownloadMapImageTask task = new DownloadMapImageTask(getContext(), map, imagesLoadedCallback);
            task.execute(mImages.toArray(new Map.Entry[mImages.size()]));
            return;
        }

        super.addToMap(mapView);
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        super.removeFromMap(mapView);

        if (hasImages()) {
            for (Map.Entry<String, String> image : mImages) {
                mMap.removeImage(image.getKey());
            }
        }

        if (hasNativeImages()) {
            for (Map.Entry<String, BitmapDrawable> image : mNativeImages) {
                mMap.removeImage(image.getKey());
            }
        }
    }

    @Override
    public GeoJsonSource makeSource() {
        GeoJsonOptions options = getOptions();

        if (mShape != null) {
            return new GeoJsonSource(mID, mShape, options);
        }

        return new GeoJsonSource(mID, mURL, options);
    }

    public void setURL(URL url) {
        mURL = url;

        if (mSource != null && mMapView != null && !mMapView.isDestroyed() ) {
            ((GeoJsonSource) mSource).setUrl(mURL);
        }
    }

    public void setShape(String geoJSONStr) {
        mShape = geoJSONStr;

        if (mSource != null && mMapView != null && !mMapView.isDestroyed() ) {
            ((GeoJsonSource) mSource).setGeoJson(mShape);
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

    public void setImages(List<Map.Entry<String, String>> images) {
        mImages = images;
    }

    public void setNativeImages(List<Map.Entry<String, BitmapDrawable>> nativeImages) {
        mNativeImages = nativeImages;
    }

    public void onPress(Feature feature) {
        mManager.handleEvent(FeatureClickEvent.makeShapeSourceEvent(this, feature));
    }

    private GeoJsonOptions getOptions() {
        GeoJsonOptions options = new GeoJsonOptions();

        if (mCluster != null) {
            options.withCluster(mCluster);
        }

        if (mClusterRadius != null) {
            options.withClusterRadius(mClusterRadius);
        }

        if (mClusterMaxZoom != null) {
            options.withClusterMaxZoom(mClusterMaxZoom);
        }

        if (mMaxZoom != null) {
            options.withMaxZoom(mMaxZoom);
        }

        if (mBuffer != null) {
            options.withBuffer(mBuffer);
        }

        if (mTolerance != null) {
            options.withTolerance(mTolerance.floatValue());
        }

        return options;
    }

    private boolean hasImages() {
        return mImages != null && mImages.size() > 0;
    }

    private boolean hasNativeImages() {
        return mNativeImages != null && mNativeImages.size() > 0;
    }
}
