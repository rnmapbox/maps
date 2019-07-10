package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.drawable.BitmapDrawable;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.content.res.ResourcesCompat;

import com.mapbox.geojson.Feature;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.mapboxsdk.style.sources.GeoJsonOptions;
import com.mapbox.mapboxsdk.style.sources.GeoJsonSource;
import com.mapbox.mapboxsdk.utils.BitmapUtils;
import com.mapbox.rctmgl.R;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.events.FeatureClickEvent;
import com.mapbox.rctmgl.utils.DownloadMapImageTask;
import com.mapbox.rctmgl.utils.ImageEntry;

import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
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

    private static Bitmap mImagePlaceholder;
    private List<Map.Entry<String, ImageEntry>> mImages;
    private List<Map.Entry<String, BitmapDrawable>> mNativeImages;

    public RCTMGLShapeSource(Context context, RCTMGLShapeSourceManager manager) {
        super(context);
        mManager = manager;
        if (mImagePlaceholder == null) {
            mImagePlaceholder = BitmapUtils.getBitmapFromDrawable(ResourcesCompat.getDrawable(context.getResources(), R.drawable.empty_drawable, null));
        }
    }

    @Override
    public void addToMap(final RCTMGLMapView mapView) {
        // Wait for style before adding the source to the map
        // only then we can pre-load required images / placeholders into the style
        // before we add the ShapeSource to the map
        mapView.getMapboxMap().getStyle(new Style.OnStyleLoaded() {
            @Override
            public void onStyleLoaded(@NonNull Style style) {
                MapboxMap map = mapView.getMapboxMap();
                addNativeImages(mNativeImages, map);
                addRemoteImages(mImages, map);
                RCTMGLShapeSource.super.addToMap(mapView);
            }
        });
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        super.removeFromMap(mapView);
        removeImages();
    }

    private void removeImages() {
        Style style = getStyle();
        if (style == null) return;
        if (hasImages()) {
            for (Map.Entry<String, ImageEntry> image : mImages) {
                style.removeImage(image.getKey());
            }
        }

        if (hasNativeImages()) {
            for (Map.Entry<String, BitmapDrawable> image : mNativeImages) {
                style.removeImage(image.getKey());
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
            mSource.setUrl(mURL);
        }
    }

    public void setShape(String geoJSONStr) {
        mShape = geoJSONStr;

        if (mSource != null && mMapView != null && !mMapView.isDestroyed() ) {
            mSource.setGeoJson(mShape);
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

    public void setImages(List<Map.Entry<String, ImageEntry>> images) {
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

    public boolean addMissingImageToStyle(@NonNull String id) {
        if (mMap == null) return false;

        if (mNativeImages != null) {
            for (Map.Entry<String, BitmapDrawable> entry : mNativeImages) {
                if (entry.getKey().equals(id)) {
                    addNativeImages(Collections.singletonList(entry), mMap );
                    return true;
                }
            }
        }
        if (mImages != null) {
            for (Map.Entry<String, ImageEntry> entry : mImages) {
                if (entry.getKey().equals(id)) {
                    addRemoteImages(Collections.singletonList(entry), mMap);
                    return true;
                }
            }
        }

        return false;
    }

    private boolean hasImage(String imageId, @NonNull MapboxMap map) {
        Style style = map.getStyle();
        return style != null && style.getImage(imageId) != null;
    }

    private void addNativeImages(@Nullable List<Map.Entry<String, BitmapDrawable>> imageEntries, @NonNull MapboxMap map) {
        Style style = map.getStyle();
        if (style == null || imageEntries == null) return;

        for (Map.Entry<String, BitmapDrawable> imageEntry : imageEntries) {
            if (!hasImage(imageEntry.getKey(), map)) {
                style.addImage(imageEntry.getKey(), imageEntry.getValue());
            }
        }
    }

    private void addRemoteImages(@Nullable List<Map.Entry<String, ImageEntry>> imageEntries, @NonNull MapboxMap map) {
        Style style = map.getStyle();
        if (style == null || imageEntries == null) return;

        List<Map.Entry<String, ImageEntry>> missingImages = new ArrayList<>();

        // Add image placeholder for images that are not yet available in the style. This way
        // we can load the images asynchronously and add the ShapeSource to the map without delay.
        // The same is required when this ShapeSource is updated with new/added images and the
        // data references them. In which case addMissingImageToStyle will take care of loading
        // them in a similar way.
        //
        // See also: https://github.com/mapbox/mapbox-gl-native/pull/14253#issuecomment-478827792
        for (Map.Entry<String, ImageEntry> imageEntry : imageEntries) {
            if (!hasImage(imageEntry.getKey(), map)) {
                style.addImage(imageEntry.getKey(), mImagePlaceholder);
                missingImages.add(imageEntry);
            }
        }

        if (missingImages.size() > 0) {
            DownloadMapImageTask task = new DownloadMapImageTask(getContext(), map, null);
            Map.Entry[] params = missingImages.toArray(new Map.Entry[missingImages.size()]);
            //noinspection unchecked
            task.execute(params);
        }
    }
}
