package com.mapbox.rctmgl.components.images;

import android.graphics.drawable.BitmapDrawable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.rctmgl.components.AbstractEventEmitter;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLShapeSource;
import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.utils.ImageEntry;
import com.mapbox.rctmgl.utils.ResourceUtils;

import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;


public class RCTMGLImagesManager extends AbstractEventEmitter<RCTMGLImages> {
    public static final String REACT_CLASS = "RCTMGLImages";

    private ReactApplicationContext mContext;

    @Override
    public String getName() {
        return "RCTMGLImages";
    }


    public RCTMGLImagesManager(ReactApplicationContext context) {
        super(context);
        mContext = context;
    }

    @Override
    public RCTMGLImages createViewInstance(ThemedReactContext context) {
        return new RCTMGLImages(context, this);
    }

    @ReactProp(name = "id")
    public void setId(RCTMGLImages source, String id) {
        source.setID(id);
    }

    @ReactProp(name = "images")
    public void setImages(RCTMGLImages images, ReadableMap map) {
        List<Map.Entry<String, ImageEntry>> imagesList = new ArrayList<>();

        ReadableMapKeySetIterator iterator = map.keySetIterator();
        while (iterator.hasNextKey()) {
            String imageName = iterator.nextKey();
            ImageEntry imageEntry = null;
            if (map.getType(imageName) == ReadableType.Map) {
                ReadableMap imageMap = map.getMap(imageName);
                String uri = imageMap.getString("uri");
                boolean hasScale = imageMap.hasKey("scale") && imageMap.getType("scale") == ReadableType.Number;
                double scale = hasScale ? imageMap.getDouble("scale") : ImageEntry.defaultScale;
                imageEntry = new ImageEntry(uri, scale);
            } else {
                imageEntry = new ImageEntry(map.getString(imageName));
            }
            imagesList.add(new AbstractMap.SimpleEntry<String, ImageEntry>(imageName, imageEntry));
        }

        images.setImages(imagesList);
    }

    @ReactProp(name = "hasOnImageMissing")
    public void setHasOnImageMissing(RCTMGLImages images, Boolean value) {
        images.setHasOnImageMissing(value);
    }

    @ReactProp(name = "nativeImages")
    public void setNativeImages(RCTMGLImages images, ReadableArray arr) {
        List<Map.Entry<String, BitmapDrawable>> resources = new ArrayList<>();

        for (int i = 0; i < arr.size(); i++) {
            String resourceName = arr.getString(i);
            BitmapDrawable drawable = (BitmapDrawable) ResourceUtils.getDrawableByName(mContext, resourceName);

            if (drawable != null) {
                resources.add(new AbstractMap.SimpleEntry<String, BitmapDrawable>(resourceName, drawable));
            }
        }

        images.setNativeImages(resources);
    }

    @Override
    public Map<String, String> customEvents() {
        return MapBuilder.<String, String>builder()
                .put(EventKeys.IMAGES_MISSING, "onImageMissing")
                .build();
    }
}
