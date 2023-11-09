package com.rnmapbox.rnmbx.events;

import android.graphics.PointF;
import androidx.annotation.NonNull;
import android.view.View;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.maps.ScreenCoordinate;
import com.rnmapbox.rnmbx.components.annotation.RNMBXPointAnnotation;
import com.rnmapbox.rnmbx.events.constants.EventKeys;
import com.rnmapbox.rnmbx.events.constants.EventTypes;
import com.rnmapbox.rnmbx.utils.ConvertUtils;
import com.rnmapbox.rnmbx.utils.GeoJSONUtils;
import com.rnmapbox.rnmbx.utils.LatLng;

public class PointAnnotationClickEvent extends MapClickEvent {
    private RNMBXPointAnnotation mView;
    private LatLng mTouchedLatLng;
    private ScreenCoordinate mScreenPoint;

    public PointAnnotationClickEvent(RNMBXPointAnnotation view, @NonNull LatLng latLng, @NonNull ScreenCoordinate screenPoint, String eventType) {
        super(view, latLng, screenPoint, eventType);
        mView = view;
        mTouchedLatLng = latLng;
        mScreenPoint = screenPoint;
    }

    @Override
    public String getKey() {
        return getType().equals(EventTypes.ANNOTATION_SELECTED) ? EventKeys.POINT_ANNOTATION_SELECTED.getValue() : EventKeys.POINT_ANNOTATION_DESELECTED.getValue();
    }

    @Override
    public WritableMap getPayload() {
        WritableMap properties = new WritableNativeMap();
        properties.putString("id", mView.getID());
        properties.putDouble("screenPointX", mScreenPoint.getX());
        properties.putDouble("screenPointY", mScreenPoint.getY());
        return GeoJSONUtils.toPointFeature(mTouchedLatLng, properties);
    }
}
