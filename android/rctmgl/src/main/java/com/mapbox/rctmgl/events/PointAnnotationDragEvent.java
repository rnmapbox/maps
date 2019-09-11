package com.mapbox.rctmgl.events;

import android.graphics.PointF;
import android.support.annotation.NonNull;
import android.view.View;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.mapboxsdk.plugins.markerview.MarkerView;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotation;
import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.events.constants.EventTypes;
import com.mapbox.rctmgl.utils.ConvertUtils;

public class PointAnnotationDragEvent extends MapClickEvent {
    public PointAnnotationDragEvent(View view, @NonNull LatLng latLng, @NonNull PointF screenPoint, String eventType) {
        super(view, latLng, screenPoint, eventType);
    }

    @Override
    public String getKey() {
        return getType().equals(EventTypes.ANNOTATION_DRAG_START) ? EventKeys.POINT_ANNOTATION_DRAG_START : EventKeys.POINT_ANNOTATION_DRAG_END;
    }
}
