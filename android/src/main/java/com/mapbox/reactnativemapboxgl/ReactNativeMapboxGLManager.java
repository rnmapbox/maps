
package com.mapbox.reactnativemapboxgl;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import com.mapbox.mapboxsdk.constants.MapboxConstants;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;

import java.util.Map;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class ReactNativeMapboxGLManager extends SimpleViewManager<ReactNativeMapboxGLView> {

    private static final String REACT_CLASS = "RCTMapboxGL";

    private ReactApplicationContext _context;

    public ReactNativeMapboxGLManager(ReactApplicationContext context) {
        super();
        _context = context;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    public ReactApplicationContext getContext() {
        return _context;
    }

    // Lifecycle methods

    @Override
    public ReactNativeMapboxGLView createViewInstance(ThemedReactContext context) {
        return new ReactNativeMapboxGLView(context, this);
    }

    @Override
    protected void onAfterUpdateTransaction(ReactNativeMapboxGLView view) {
        super.onAfterUpdateTransaction(view);
        view.onAfterUpdateTransaction();
    }

    @Override
    public void onDropViewInstance(ReactNativeMapboxGLView view) {
        view.onDrop();
    }

    // Event types

    public @Nullable Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.<String,Object>builder()
                .put("onRegionDidChange", MapBuilder.of("registrationName", "onRegionDidChange"))
                .put("onRegionWillChange", MapBuilder.of("registrationName", "onRegionWillChange"))
                .put("onOpenAnnotation", MapBuilder.of("registrationName", "onOpenAnnotation"))
                .put("onRightAnnotationTapped", MapBuilder.of("registrationName", "onRightAnnotationTapped"))
                .put("onChangeUserTrackingMode", MapBuilder.of("registrationName", "onChangeUserTrackingMode"))
                .put("onUpdateUserLocation", MapBuilder.of("registrationName", "onUpdateUserLocation"))
                .put("onLongPress", MapBuilder.of("registrationName", "onLongPress"))
                .put("onTap", MapBuilder.of("registrationName", "onTap"))
                .put("onFinishLoadingMap", MapBuilder.of("registrationName", "onFinishLoadingMap"))
                .put("onStartLoadingMap", MapBuilder.of("registrationName", "onStartLoadingMap"))
                .put("onLocateUserFailed", MapBuilder.of("registrationName", "onLocateUserFailed"))
                .build();
    }

    // Props

    @ReactProp(name = "initialZoomLevel")
    public void setInitialZoomLevel(ReactNativeMapboxGLView view, double value) {
        view.setInitialZoomLevel(value);
    }

    @ReactProp(name = "minimumZoomLevel")
    public void setMinumumZoomLevel(ReactNativeMapboxGLView view, double value) {
        view.setMinimumZoomLevel(value);
    }

    @ReactProp(name = "maximumZoomLevel")
    public void setMaxumumZoomLevel(ReactNativeMapboxGLView view, double value) {
        view.setMaximumZoomLevel(value);
    }

    @ReactProp(name = "initialDirection")
    public void setInitialDirection(ReactNativeMapboxGLView view, double value) {
        view.setInitialDirection(value);
    }

    @ReactProp(name = "initialCenterCoordinate")
    public void setInitialCenterCoordinate(ReactNativeMapboxGLView view, ReadableMap coord) {
        double lat = coord.getDouble("latitude");
        double lon = coord.getDouble("longitude");
        view.setInitialCenterCoordinate(lat, lon);
    }

    @ReactProp(name = "enableOnRegionDidChange")
    public void setEnableOnRegionDidChange(ReactNativeMapboxGLView view, boolean value) {
        view.setEnableOnRegionDidChange(value);
    }

    @ReactProp(name = "enableOnRegionWillChange")
    public void setEnableOnRegionWillChange(ReactNativeMapboxGLView view, boolean value) {
        view.setEnableOnRegionWillChange(value);
    }

    @ReactProp(name = "debugActive")
    public void setDebugActive(ReactNativeMapboxGLView view, boolean value) {
        view.setDebugActive(value);
    }

    @ReactProp(name = "rotateEnabled")
    public void setRotateEnabled(ReactNativeMapboxGLView view, boolean value) {
        view.setRotateEnabled(value);
    }

    @ReactProp(name = "scrollEnabled")
    public void setScrollEnabled(ReactNativeMapboxGLView view, boolean value) {
        view.setScrollEnabled(value);
    }

    @ReactProp(name = "zoomEnabled")
    public void setZoomEnabled(ReactNativeMapboxGLView view, boolean value) {
        view.setZoomEnabled(value);
    }

    @ReactProp(name = "pitchEnabled")
    public void setPitchEnabled(ReactNativeMapboxGLView view, boolean value) {
        view.setPitchEnabled(value);
    }

    @ReactProp(name = "annotationsPopUpEnabled")
    public void setAnnotationsPopUpEnabled(ReactNativeMapboxGLView view, boolean value) {
        view.setAnnotationsPopUpEnabled(value);
    }

    @ReactProp(name = "showsUserLocation")
    public void setShowsUserLocation(ReactNativeMapboxGLView view, boolean value) {
        view.setShowsUserLocation(value);
    }

    @ReactProp(name = "styleURL")
    public void setStyleUrl(ReactNativeMapboxGLView view, @Nonnull String styleURL) {
        view.setStyleURL(styleURL);
    }

    @ReactProp(name = "userTrackingMode")
    public void setUserTrackingMode(ReactNativeMapboxGLView view, int mode) {
        view.setLocationTracking(ReactNativeMapboxGLModule.locationTrackingModes[mode]);
        view.setBearingTracking(ReactNativeMapboxGLModule.bearingTrackingModes[mode]);
    }

    @ReactProp(name = "attributionButtonIsHidden")
    public void setAttributionButtonIsHidden(ReactNativeMapboxGLView view, boolean value) {
        view.setAttributionButtonIsHidden(value);
    }

    @ReactProp(name = "logoIsHidden")
    public void setLogoIsHidden(ReactNativeMapboxGLView view, boolean value) {
        view.setLogoIsHidden(value);
    }

    @ReactProp(name = "compassIsHidden")
    public void setCompassIsHidden(ReactNativeMapboxGLView view, boolean value) {
        view.setCompassIsHidden(value);
    }

    @ReactProp(name = "contentInset")
    public void setContentInset(ReactNativeMapboxGLView view, ReadableArray inset) {
        view.setContentInset(inset.getInt(0), inset.getInt(1), inset.getInt(2), inset.getInt(3));
    }

    // Commands

    public static final int COMMAND_GET_DIRECTION = 0;
    public static final int COMMAND_GET_PITCH = 1;
    public static final int COMMAND_GET_CENTER_COORDINATE_ZOOM_LEVEL = 2;
    public static final int COMMAND_GET_BOUNDS = 3;
    public static final int COMMAND_EASE_TO = 4;
    public static final int COMMAND_SET_VISIBLE_COORDINATE_BOUNDS = 6;
    public static final int COMMAND_SELECT_ANNOTATION = 7;
    public static final int COMMAND_SPLICE_ANNOTATIONS = 8;
    public static final int COMMAND_DESELECT_ANNOTATION = 9;

    @Override
    public
    @Nullable
    Map<String, Integer> getCommandsMap() {
        return MapBuilder.<String, Integer>builder()
                .put("getDirection", COMMAND_GET_DIRECTION)
                .put("getPitch", COMMAND_GET_PITCH)
                .put("getCenterCoordinateZoomLevel", COMMAND_GET_CENTER_COORDINATE_ZOOM_LEVEL)
                .put("getBounds", COMMAND_GET_BOUNDS)
                .put("easeTo", COMMAND_EASE_TO)
                .put("setVisibleCoordinateBounds", COMMAND_SET_VISIBLE_COORDINATE_BOUNDS)
                .put("selectAnnotation", COMMAND_SELECT_ANNOTATION)
                .put("spliceAnnotations", COMMAND_SPLICE_ANNOTATIONS)
                .put("deselectAnnotation", COMMAND_DESELECT_ANNOTATION)
                .build();
    }

    private void fireCallback(int callbackId, WritableArray args) {
        WritableArray event = Arguments.createArray();
        event.pushInt(callbackId);
        event.pushArray(args);

        _context.getJSModule(RCTNativeAppEventEmitter.class)
                .emit("MapboxAndroidCallback", event);
    }

    @Override
    public void receiveCommand(ReactNativeMapboxGLView view, int commandId, @Nullable ReadableArray args) {
        Assertions.assertNotNull(args);
        switch (commandId) {
            case COMMAND_GET_DIRECTION:
                getDirection(view, args.getInt(0));
                break;
            case COMMAND_GET_PITCH:
                getPitch(view, args.getInt(0));
                break;
            case COMMAND_GET_CENTER_COORDINATE_ZOOM_LEVEL:
                getCenterCoordinateZoomLevel(view, args.getInt(0));
                break;
            case COMMAND_GET_BOUNDS:
                getBounds(view, args.getInt(0));
                break;
            case COMMAND_EASE_TO:
                easeTo(view, args.getMap(0), args.getBoolean(1), args.getInt(2));
                break;
            case COMMAND_SET_VISIBLE_COORDINATE_BOUNDS:
                setVisibleCoordinateBounds(view,
                        args.getDouble(0), args.getDouble(1), args.getDouble(2), args.getDouble(3),
                        args.getDouble(4), args.getDouble(5), args.getDouble(6), args.getDouble(7),
                        args.getBoolean(8)
                );
                break;
            case COMMAND_SELECT_ANNOTATION:
                selectAnnotation(view, args.getString(0), args.getBoolean(1));
                break;
            case COMMAND_SPLICE_ANNOTATIONS:
                spliceAnnotations(view, args.getBoolean(0), args.getArray(1), args.getArray(2));
                break;
            case COMMAND_DESELECT_ANNOTATION:
                deselectAnnotation(view);
                break;
            default:
                throw new JSApplicationIllegalArgumentException("Invalid commandId " + commandId + " sent to " + getClass().getSimpleName());
        }
    }

    // Getters

    private void getDirection(ReactNativeMapboxGLView view, int callbackId) {
        WritableArray result = Arguments.createArray();
        result.pushDouble(view.getCameraPosition().bearing);
        fireCallback(callbackId, result);
    }

    private void getPitch(ReactNativeMapboxGLView view, int callbackId) {
        WritableArray result = Arguments.createArray();
        result.pushDouble(view.getCameraPosition().tilt);
        fireCallback(callbackId, result);
    }

    private void getCenterCoordinateZoomLevel(ReactNativeMapboxGLView view, int callbackId) {
        CameraPosition camera = view.getCameraPosition();

        WritableArray args = Arguments.createArray();
        WritableMap result = Arguments.createMap();
        result.putDouble("latitude", camera.target.getLatitude());
        result.putDouble("longitude", camera.target.getLongitude());
        result.putDouble("zoomLevel", camera.zoom);
        args.pushMap(result);

        fireCallback(callbackId, args);
    }

    private void getBounds(ReactNativeMapboxGLView view, int callbackId) {
        LatLngBounds bounds = view.getBounds();

        WritableArray args = Arguments.createArray();
        WritableArray result = Arguments.createArray();
        result.pushDouble(bounds.getLatSouth());
        result.pushDouble(bounds.getLonWest());
        result.pushDouble(bounds.getLatNorth());
        result.pushDouble(bounds.getLonEast());
        args.pushArray(result);

        fireCallback(callbackId, args);
    }

    // Setters

    private void easeTo(ReactNativeMapboxGLView view, ReadableMap updates, boolean animated, int callbackId) {
        CameraPosition oldPosition = view.getCameraPosition();
        CameraPosition.Builder cameraBuilder = new CameraPosition.Builder(oldPosition);

        if (updates.hasKey("latitude") && updates.hasKey("longitude")) {
            cameraBuilder.target(new LatLng(updates.getDouble("latitude"), updates.getDouble("longitude")));
        }
        if (updates.hasKey("zoomLevel")) {
            cameraBuilder.zoom(updates.getDouble("zoomLevel"));
        }
        if (updates.hasKey("direction")) {
            cameraBuilder.bearing(updates.getDouble("direction"));
        }
        if (updates.hasKey("pitch")) {
            cameraBuilder.tilt(updates.getDouble("pitch"));
        }

        // I want lambdas :(
        class CallbackRunnable implements Runnable {
            int callbackId;
            ReactNativeMapboxGLManager manager;

            CallbackRunnable(ReactNativeMapboxGLManager manager, int callbackId) {
                this.callbackId = callbackId;
                this.manager = manager;
            }

            @Override
            public void run() {
                manager.fireCallback(callbackId, Arguments.createArray());
            }
        }

        int duration = animated ? MapboxConstants.ANIMATION_DURATION : 0;
        view.setCameraPosition(cameraBuilder.build(), duration, new CallbackRunnable(this, callbackId));
    }

    public void setCamera(
            ReactNativeMapboxGLView view,
            double latitude, double longitude,
            double altitude, double pitch, double direction,
            double duration) {
        throw new JSApplicationIllegalArgumentException("MapView.setCamera() is not supported on Android. If you're trying to change pitch, use MapView.easeTo()");
    }

    public void setVisibleCoordinateBounds(
            ReactNativeMapboxGLView view,
            double latS, double lonW, double latN, double lonE,
            double paddingTop, double paddingRight, double paddingBottom, double paddingLeft,
            boolean animated) {
        CameraUpdate update = CameraUpdateFactory.newLatLngBounds(
                new LatLngBounds.Builder()
                        .include(new LatLng(latS, lonW))
                        .include(new LatLng(latN, lonE))
                        .build(),
                (int) paddingLeft,
                (int) paddingTop,
                (int) paddingRight,
                (int) paddingBottom
        );
        view.setCameraUpdate(update, animated ? MapboxConstants.ANIMATION_DURATION : 0, null);
    }

    // Annotations

    public void spliceAnnotations(ReactNativeMapboxGLView view, boolean removeAll, ReadableArray itemsToRemove, ReadableArray itemsToAdd) {
        if (removeAll) {
            view.removeAllAnnotations();
        } else {
            int removeCount = itemsToRemove.size();
            for (int i = 0; i < removeCount; i++) {
                view.removeAnnotation(itemsToRemove.getString(i));
            }
        }

        int addCount = itemsToAdd.size();
        for (int i = 0; i < addCount; i++) {
            ReadableMap annotation = itemsToAdd.getMap(i);
            RNMGLAnnotationOptions annotationOptions = RNMGLAnnotationOptionsFactory.annotationOptionsFromJS(annotation, view.getContext());

            String name = annotation.getString("id");
            view.setAnnotation(name, annotationOptions);
        }
    }

    public void selectAnnotation(ReactNativeMapboxGLView view, String annotationId, boolean animated) {
        view.selectAnnotation(annotationId, animated);
    }

    public void deselectAnnotation(ReactNativeMapboxGLView view) {
        view.deselectAnnotation();
    }
}
