package com.rnmapbox.rnmbx.events;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.rnmapbox.rnmbx.events.constants.EventKeys;
import com.rnmapbox.rnmbx.events.constants.EventTypes;

import android.view.View;

public class ImageMissingEvent extends AbstractEvent {
    private String mEventKey;
    private String mImageKey;

    public ImageMissingEvent(View view, String eventKey, String eventType, String imageKey) {
        super(view, eventType);
        mImageKey = imageKey;
        mEventKey = eventKey;
    }

    @Override
    public String getKey() {
        return mEventKey;
    }

    @Override
    public WritableMap getPayload() {
        WritableMap imageMissingProperties = new WritableNativeMap();
        imageMissingProperties.putString("imageKey", mImageKey);
        return imageMissingProperties;

    }

    public static ImageMissingEvent makeImageMissingEvent(View view, String imageKey) {
        return new ImageMissingEvent(view, EventKeys.IMAGES_MISSING.getValue(),
                EventTypes.IMAGES_MISSING, imageKey);
    }

    @Override
    public boolean canCoalesce() {
        return false;
    }
}