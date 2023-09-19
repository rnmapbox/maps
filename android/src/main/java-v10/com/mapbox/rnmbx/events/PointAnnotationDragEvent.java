package com.mapbox.rnmbx.events;

import android.graphics.PointF;
import androidx.annotation.NonNull;
import android.view.View;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.maps.ScreenCoordinate;
import com.mapbox.rnmbx.components.annotation.RNMBXPointAnnotation;
import com.mapbox.rnmbx.events.constants.EventKeys;
import com.mapbox.rnmbx.events.constants.EventTypes;
import com.mapbox.rnmbx.utils.ConvertUtils;
import com.mapbox.rnmbx.utils.GeoJSONUtils;
import com.mapbox.rnmbx.utils.LatLng;

public class PointAnnotationDragEvent extends MapClickEvent {
    RNMBXPointAnnotation mView;
    private LatLng mTouchedLatLng;
    private PointF mScreenPoint;

    public PointAnnotationDragEvent(RNMBXPointAnnotation view, @NonNull LatLng latLng, @NonNull PointF screenPoint, String eventType) {
        super(view, latLng, new ScreenCoordinate(screenPoint.x, screenPoint.y), eventType);
        mView = view;
        mTouchedLatLng = latLng;
        mScreenPoint = screenPoint;
    }

    @Override
    public String getKey() {
        String eventType = getType();

        if (eventType.equals(EventTypes.ANNOTATION_DRAG_START)) {
            return EventKeys.POINT_ANNOTATION_DRAG_START;
        }
        if (eventType.equals(EventTypes.ANNOTATION_DRAG_END)) {
            return EventKeys.POINT_ANNOTATION_DRAG_END;
        }

        return EventKeys.POINT_ANNOTATION_DRAG;
    }

    @Override
    public WritableMap getPayload() {
        WritableMap properties = new WritableNativeMap();
        properties.putDouble("screenPointX", mScreenPoint.x);
        properties.putDouble("screenPointY", mScreenPoint.y);
        WritableMap feature = GeoJSONUtils.toPointFeature(mTouchedLatLng, properties);
        feature.putString("id", mView.getID());
        
        return feature;
    }
}
