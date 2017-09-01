package mapbox.rctmgl.modules;

import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.mapbox.mapboxsdk.Mapbox;
import com.mapbox.mapboxsdk.constants.Style;
import com.mapbox.mapboxsdk.plugins.locationlayer.LocationLayerMode;
import com.mapbox.services.android.telemetry.permissions.PermissionsListener;
import com.mapbox.services.android.telemetry.permissions.PermissionsManager;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nullable;

import mapbox.rctmgl.events.constants.EventTypes;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class RCTMGLModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = RCTMGLModule.class.getSimpleName();

    private Handler mUiThreadHandler;
    private ReactApplicationContext mReactContext;

    public RCTMGLModule(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
        mReactContext = reactApplicationContext;
        mUiThreadHandler = new Handler(Looper.getMainLooper());
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    @Nullable
    public Map<String, Object> getConstants() {
        // map style urls
        Map<String, String> styleURLS = new HashMap<>();
        styleURLS.put("Street", Style.MAPBOX_STREETS);
        styleURLS.put("Dark", Style.DARK);
        styleURLS.put("Light", Style.LIGHT);
        styleURLS.put("Outdoors", Style.OUTDOORS);
        styleURLS.put("Satellite", Style.SATELLITE);

        // events
        Map<String, String> eventTypes = new HashMap<>();
        eventTypes.put("MapClick", EventTypes.MAP_CLICK);
        eventTypes.put("MapLongClick", EventTypes.MAP_LONG_CLICK);
        eventTypes.put("RegionWilChange", EventTypes.REGION_WILL_CHANGE);
        eventTypes.put("RegionIsChanging", EventTypes.REGION_IS_CHANGING);
        eventTypes.put("RegionDidChange", EventTypes.REGION_DID_CHANGE);
        eventTypes.put("WillStartLoadingMap", EventTypes.WILL_START_LOADING_MAP);
        eventTypes.put("DidFinishLoadingMap", EventTypes.DID_FINISH_LOADING_MAP);
        eventTypes.put("DidFailLoadingMap", EventTypes.DID_FAIL_LOADING_MAP);
        eventTypes.put("WillStartRenderingFrame", EventTypes.WILL_START_RENDERING_FRAME);
        eventTypes.put("DidFinishRenderingFrame", EventTypes.DID_FINISH_RENDERING_FRAME);
        eventTypes.put("DidFinishRenderingFrameFully", EventTypes.DID_FINISH_RENDERING_FRAME_FULLY);
        eventTypes.put("WillStartRenderingMap", EventTypes.WILL_START_RENDERING_MAP);
        eventTypes.put("DidFinishRenderingMap", EventTypes.DID_FINISH_RENDERING_MAP);
        eventTypes.put("DidFinishRenderingMapFully", EventTypes.DID_FINISH_RENDERING_MAP_FULLY);
        eventTypes.put("DidFinishLoadingStyle", EventTypes.DID_FINISH_LOADING_STYLE);
        eventTypes.put("FlyToComplete", EventTypes.FLY_TO_COMPLETE);
        eventTypes.put("SetCameraComplete", EventTypes.SET_CAMERA_COMPLETE);

        // user tracking modes
        Map<String, Integer> userTrackingModes = new HashMap<>();
        userTrackingModes.put("None", LocationLayerMode.NONE);
        userTrackingModes.put("Tracking", LocationLayerMode.TRACKING);
        userTrackingModes.put("Navigation", LocationLayerMode.NAVIGATION);
        userTrackingModes.put("Compass", LocationLayerMode.COMPASS);

        return MapBuilder.<String, Object>builder()
                .put("StyleURL", styleURLS)
                .put("EventTypes", eventTypes)
                .put("UserTrackingModes", userTrackingModes)
                .build();
    }

    @ReactMethod
    public void setAccessToken(final String accessToken) {
        mUiThreadHandler.post(new Runnable() {
            @Override
            public void run() {
                Mapbox.getInstance(getReactApplicationContext(), accessToken);
            }
        });
    }

    @ReactMethod
    public void getAccessToken(Promise promise) {
        WritableMap map = Arguments.createMap();
        map.putString("accessToken", Mapbox.getAccessToken());
        promise.resolve(map);
    }

    @ReactMethod
    public void requestPermissions(final Promise promise) {
        if (!PermissionsManager.areLocationPermissionsGranted(mReactContext)) {
            // ask user to grant location permissions
            PermissionsManager permissionsManager = new PermissionsManager(new PermissionsListener() {
                @Override
                public void onExplanationNeeded(List<String> permissionsToExplain) {
                    // do nothing
                }

                @Override
                public void onPermissionResult(boolean granted) {
                    handlePermissionResponse(promise, granted);
                }
            });

            permissionsManager.requestLocationPermissions(getCurrentActivity());
        } else {
           handlePermissionResponse(promise, true);
        }
    }

    private void handlePermissionResponse(Promise promise, boolean isGranted) {
        WritableMap map = Arguments.createMap();
        map.putBoolean("isGranted", isGranted);
        promise.resolve(map);
    }
}
