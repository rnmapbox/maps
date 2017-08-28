package mapbox.rctmgl.components.mapview;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.services.commons.geojson.Point;

import java.util.Map;

import javax.annotation.Nullable;

import mapbox.rctmgl.components.AbstractEventEmitter;
import mapbox.rctmgl.events.RCTMGLEventKeys;
import mapbox.rctmgl.utils.MGLGeoUtils;
import mapbox.rctmgl.utils.RCTMGLMapStyleURL;
import mapbox.rctmgl.events.RCTMGLEventTypes;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class RCTMGLMapViewManager extends AbstractEventEmitter<RCTMGLMapView> {
    public static final String REACT_CLASS = RCTMGLMapView.class.getSimpleName();

    public RCTMGLMapViewManager(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected void onAfterUpdateTransaction(RCTMGLMapView mapView) {
        super.onAfterUpdateTransaction(mapView);
        mapView.makeView();
    }

    @Override
    protected RCTMGLMapView createViewInstance(ThemedReactContext themedReactContext) {
        return new RCTMGLMapView(themedReactContext, this);
    }

    //region React Props

    @ReactProp(name="styleURL")
    public void setStyleURL(RCTMGLMapView mapView, String styleURL) {
        RCTMGLMapStyleURL mapStyle = RCTMGLMapStyleURL.fromKey(styleURL);

        if (mapStyle != null) {
            mapView.setStyleURL(mapStyle.getURL());
            return;
        }

        mapView.setStyleURL(styleURL);
    }

    @ReactProp(name="animated")
    public void setAnimated(RCTMGLMapView mapView, boolean isAnimated) {
        mapView.setAnimated(isAnimated);
    }

    @ReactProp(name="scrollEnabled")
    public void setScrollEnabled(RCTMGLMapView mapView, boolean scrollEnabled) {
        mapView.setScrollEnabled(scrollEnabled);
    }

    @ReactProp(name="pitchEnabled")
    public void setPitchEnabled(RCTMGLMapView mapView, boolean pitchEnabled) {
        mapView.setPitchEnabled(pitchEnabled);
    }

    @ReactProp(name="heading")
    public void setHeading(RCTMGLMapView mapView, double heading) {
        mapView.setHeading(heading);
    }

    @ReactProp(name="pitch")
    public void setPitch(RCTMGLMapView mapView, double pitch) {
        mapView.setPitch(pitch);
    }

    @ReactProp(name="zoomLevel")
    public void setZoomLevel(RCTMGLMapView mapView, double zoomLevel) {
        mapView.setZoomLevel(zoomLevel);
    }

    @ReactProp(name="minZoomLevel")
    public void setMinZoomLevel(RCTMGLMapView mapView, double minZoomLevel) {
        mapView.setMinZoomLevel(minZoomLevel);
    }

    @ReactProp(name="maxZoomLevel")
    public void setMaxZoomLevel(RCTMGLMapView mapView, double maxZoomLevel) {
        mapView.setMaxZoomLevel(maxZoomLevel);
    }

    @ReactProp(name="centerCoordinate")
    public void setCenterCoordinate(RCTMGLMapView mapView, ReadableMap map) {
        Point centerCoordinate = MGLGeoUtils.readableMapToPoint(map);

        if (centerCoordinate != null) {
            mapView.setCenterCoordinate(centerCoordinate);
        }
    }

    //endregion

    //region Custom Events

    @Override
    public Map<String, String> customEvents() {
        return MapBuilder.<String, String>builder()
                .put(RCTMGLEventKeys.MAP_CLICK, "onPress")
                .put(RCTMGLEventKeys.MAP_LONG_CLICK,"onLongPress")
                .put(RCTMGLEventKeys.MAP_ONCHANGE, "onMapChange")
                .build();
    }

    //endregion

    //region React Methods

    public static final int METHOD_FLY_TO = 1;


    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.<String, Integer>builder()
                .put("flyTo", METHOD_FLY_TO)
                .build();
    }

    @Override
    public void receiveCommand(RCTMGLMapView mapView, int commandID, @Nullable ReadableArray args) {
        Assertions.assertNotNull(args);

        switch (commandID) {
            case METHOD_FLY_TO:
                flyTo(mapView, args.getMap(0), args.getInt(1));
                break;
        }
    }

    private void flyTo(RCTMGLMapView mapView, ReadableMap flyToMap, int durationMS) {
        Point flyToPoint = MGLGeoUtils.readableMapToPoint(flyToMap);

        if (flyToPoint != null) {
            mapView.flyTo(flyToPoint, durationMS);
        }
    }

    //endregion
}
