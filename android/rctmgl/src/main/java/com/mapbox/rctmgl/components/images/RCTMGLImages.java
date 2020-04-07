package com.mapbox.rctmgl.components.images;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.drawable.BitmapDrawable;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.res.ResourcesCompat;

import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.mapboxsdk.utils.BitmapUtils;
import com.mapbox.rctmgl.R;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.events.ImageMissingEvent;
import com.mapbox.rctmgl.utils.DownloadMapImageTask;
import com.mapbox.rctmgl.utils.ImageEntry;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class RCTMGLImages extends AbstractMapFeature {
    private static Bitmap mImagePlaceholder;
    private List<Map.Entry<String, ImageEntry>> mImages;
    private List<Map.Entry<String, BitmapDrawable>> mNativeImages;
    private RCTMGLImagesManager mManager;
    private boolean mSendMissingImageEvents = false;

    protected String mID;

    public String getID() {
        return mID;
    }

    public void setID(String id) {
        mID = id;
    }

    public RCTMGLImages(Context context, RCTMGLImagesManager manager) {
        super(context);
        mManager = manager;
        if (mImagePlaceholder == null) {
            mImagePlaceholder = BitmapUtils.getBitmapFromDrawable(ResourcesCompat.getDrawable(context.getResources(), R.drawable.empty_drawable, null));
        }
    }

    public void setImages(List<Map.Entry<String, ImageEntry>> images) {
        mImages = images;
    }

    public void setNativeImages(List<Map.Entry<String, BitmapDrawable>> nativeImages) {
        mNativeImages = nativeImages;
    }

    public void setHasOnImageMissing(boolean value) {
        mSendMissingImageEvents = value;
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {
        removeImages(mapView);
    }

    private void removeImages(RCTMGLMapView mapView) {
        mapView.getStyle(new Style.OnStyleLoaded() {
            @Override
            public void onStyleLoaded(@NonNull Style style) {
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
            }});
    }

    private boolean hasImages() {
        return mImages != null && mImages.size() > 0;
    }

    private boolean hasNativeImages() {
        return mNativeImages != null && mNativeImages.size() > 0;
    }

    public boolean addMissingImageToStyle(@NonNull String id, @NonNull MapboxMap map) {
        if (mNativeImages != null) {
            for (Map.Entry<String, BitmapDrawable> entry : mNativeImages) {
                if (entry.getKey().equals(id)) {
                    addNativeImages(Collections.singletonList(entry), map );
                    return true;
                }
            }
        }
        if (mImages != null) {
            for (Map.Entry<String, ImageEntry> entry : mImages) {
                if (entry.getKey().equals(id)) {
                    addRemoteImages(Collections.singletonList(entry), map);
                    return true;
                }
            }
        }

        return false;
    }

    public void sendImageMissingEvent(@NonNull String id, @NonNull MapboxMap map) {
        if (mSendMissingImageEvents) {
            mManager.handleEvent(ImageMissingEvent.makeImageMissingEvent(this, id));
        }
    }

    private boolean hasImage(String imageId, @NonNull MapboxMap map) {
        Style style = map.getStyle();
        return style != null && style.getImage(imageId) != null;
    }

    @Override
    public void addToMap(final RCTMGLMapView mapView) {
        // Wait for style before adding the source to the map
        // only then we can pre-load required images / placeholders into the style
        // before we add the ShapeSource to the map
        mapView.getStyle(new Style.OnStyleLoaded() {
            @Override
            public void onStyleLoaded(@NonNull Style style) {
                MapboxMap map = mapView.getMapboxMap();
                addNativeImages(mNativeImages, map);
                addRemoteImages(mImages, map);
                // super.addToMap(mapView);
            }
        });
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
