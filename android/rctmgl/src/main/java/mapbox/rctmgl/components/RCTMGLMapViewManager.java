package mapbox.rctmgl.components;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.services.commons.geojson.Point;

import java.util.Map;

import mapbox.rctmgl.utils.MGLGeoUtils;
import mapbox.rctmgl.utils.RCTMGLMapStyleURL;
import mapbox.rctmgl.events.RCTMGLEventNames;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class RCTMGLMapViewManager extends RCTAbstractEventEmitter<RCTMGLMapView> {
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

    @ReactProp(name="centerCoordinate")
    public void setCenterCoordinate(RCTMGLMapView mapView, ReadableMap map) {
        Point centerCoordinate = MGLGeoUtils.readableMapToPoint(map);

        if (centerCoordinate != null) {
            mapView.setCenterCoordinate(centerCoordinate);
        }
    }

    @Override
    public Map<String, String> customEvents() {
        return MapBuilder.<String, String>builder()
                .put(RCTMGLEventNames.MAP_CLICK, "onPress")
                .put(RCTMGLEventNames.MAP_LONG_CLICK,"onLongPress")
                .build();
    }
}
