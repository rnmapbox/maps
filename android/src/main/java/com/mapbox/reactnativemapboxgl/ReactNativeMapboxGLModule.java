
package com.mapbox.reactnativemapboxgl;

import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Parcel;
import android.support.annotation.MainThread;
import android.support.annotation.UiThread;
import android.util.Log;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInput;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableNativeMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.mapbox.mapboxsdk.MapboxAccountManager;
import com.mapbox.mapboxsdk.constants.MyLocationTracking;
import com.mapbox.mapboxsdk.constants.MyBearingTracking;
import com.mapbox.mapboxsdk.constants.Style;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;
import com.mapbox.mapboxsdk.offline.OfflineManager;
import com.mapbox.mapboxsdk.offline.OfflineRegion;
import com.mapbox.mapboxsdk.offline.OfflineRegionDefinition;
import com.mapbox.mapboxsdk.offline.OfflineRegionError;
import com.mapbox.mapboxsdk.offline.OfflineRegionStatus;
import com.mapbox.mapboxsdk.offline.OfflineTilePyramidRegionDefinition;
import com.mapbox.mapboxsdk.telemetry.MapboxEventManager;

import javax.annotation.Nullable;

public class ReactNativeMapboxGLModule extends ReactContextBaseJavaModule {

    private static final String TAG = ReactNativeMapboxGLModule.class.getSimpleName();

    private ReactApplicationContext context;
    private ReactNativeMapboxGLPackage aPackage;
    Handler mainHandler;
    private static boolean initialized = false;

    public ReactNativeMapboxGLModule(ReactApplicationContext reactContext, ReactNativeMapboxGLPackage thePackage) {
        super(reactContext);
        this.mainHandler = new Handler(reactContext.getApplicationContext().getMainLooper());
        this.context = reactContext;
        this.aPackage = thePackage;
        Log.d(TAG, "Context " + context);
        Log.d(TAG, "reactContext " + reactContext);
    }

    @Override
    public String getName() {
        return "MapboxGLManager";
    }

    static private ArrayList<Integer> serializeTracking(int locationTracking, int bearingTracking) {
        ArrayList<Integer> result = new ArrayList<Integer>();
        result.add(locationTracking);
        result.add(bearingTracking);
        return result;
    }

    public static final int[] locationTrackingModes = new int[] {
            MyLocationTracking.TRACKING_NONE,
            MyLocationTracking.TRACKING_FOLLOW,
            MyLocationTracking.TRACKING_FOLLOW,
            MyLocationTracking.TRACKING_FOLLOW
    };

    public static final int[] bearingTrackingModes = new int[] {
            MyBearingTracking.NONE,
            MyBearingTracking.NONE,
            MyBearingTracking.GPS,
            MyBearingTracking.COMPASS
    };

    @Override
    public @Nullable Map<String, Object> getConstants() {
        HashMap<String, Object> constants = new HashMap<String, Object>();

        HashMap<String, Object> userTrackingMode = new HashMap<String, Object>();
        HashMap<String, Object> mapStyles = new HashMap<String, Object>();
        HashMap<String, Object> userLocationVerticalAlignment = new HashMap<String, Object>();

        // User tracking constants
        userTrackingMode.put("none", 0);
        userTrackingMode.put("follow", 1);
        userTrackingMode.put("followWithCourse", 2);
        userTrackingMode.put("followWithHeading", 3);

        // Style constants
        mapStyles.put("light", Style.LIGHT);
        mapStyles.put("dark", Style.DARK);
        mapStyles.put("streets", Style.MAPBOX_STREETS);
        mapStyles.put("emerald", Style.EMERALD);
        mapStyles.put("satellite", Style.SATELLITE);
        mapStyles.put("hybrid", Style.SATELLITE_STREETS);

        // These need to be here for compatibility, even if they're not supported on Android
        userLocationVerticalAlignment.put("center", 0);
        userLocationVerticalAlignment.put("top", 1);
        userLocationVerticalAlignment.put("bottom", 2);

        // Other constants
        constants.put("unknownResourceCount", Long.MAX_VALUE);
        constants.put("metricsEnabled", MapboxEventManager.getMapboxEventManager().isTelemetryEnabled());

        constants.put("userTrackingMode", userTrackingMode);
        constants.put("mapStyles", mapStyles);
        constants.put("userLocationVerticalAlignment", userLocationVerticalAlignment);

        return constants;
    }

    // Access Token

    @ReactMethod
    public void setAccessToken(String accessToken) {
        if (accessToken == null || accessToken.length() == 0 || accessToken.equals("your-mapbox.com-access-token")) {
            throw new JSApplicationIllegalArgumentException("Invalid access token. Register to mapbox.com and request an access token, then pass it to setAccessToken()");
        }
        if (initialized) {
            String oldToken = MapboxAccountManager.getInstance().getAccessToken();
            if (!oldToken.equals(accessToken)) {
                throw new JSApplicationIllegalArgumentException("Mapbox access token cannot be initialized twice with different values");
            }
            return;
        }
        initialized = true;
        MapboxAccountManager.start(context.getApplicationContext(), accessToken);
        initializeOfflinePacks();
    }

    // Metrics

    @ReactMethod
    public void setMetricsEnabled(boolean value) {
        MapboxEventManager.getMapboxEventManager().setTelemetryEnabled(value);
    }

    // Offline packs

    // Offline pack events

    class OfflineRegionProgressObserver implements OfflineRegion.OfflineRegionObserver {
        ReactNativeMapboxGLModule module;
        OfflineRegion region;
        OfflineRegionStatus status;
        boolean recentlyUpdated = false;
        boolean throttled = true;

        OfflineRegionProgressObserver(ReactNativeMapboxGLModule module, OfflineRegion region) {
            this.module = module;
            this.region = region;
        }

        void fireUpdateEvent() {
            recentlyUpdated = true;
            WritableMap event = serializeOfflineRegionStatus(region, this.status);
            module.getReactApplicationContext().getJSModule(RCTNativeAppEventEmitter.class)
                    .emit("MapboxOfflineProgressDidChange", event);

            module.mainHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    recentlyUpdated = false;
                    if (throttled) {
                        throttled = false;
                        fireUpdateEvent();
                    }
                }
            }, 100);
        }

        @Override
        public void onStatusChanged(OfflineRegionStatus status) {
            this.status = status;

            if (!recentlyUpdated) {
                fireUpdateEvent();
            } else {
                throttled = true;
            }
        }

        @Override
        public void onError(OfflineRegionError error) {
            WritableMap event = Arguments.createMap();
            event.putString("name", getOfflineRegionName(region));
            event.putString("error", error.toString());

            module.getReactApplicationContext().getJSModule(RCTNativeAppEventEmitter.class)
                    .emit("MapboxOfflineError", event);
        }

        @Override
        public void mapboxTileCountLimitExceeded(long limit) {
            WritableMap event = Arguments.createMap();
            event.putString("name", getOfflineRegionName(region));
            event.putDouble("maxTiles", limit);

            module.getReactApplicationContext().getJSModule(RCTNativeAppEventEmitter.class)
                    .emit("MapboxOfflineMaxAllowedTiles", event);
        }
    }

    class OfflineRegionsInitialRequest implements OfflineManager.ListOfflineRegionsCallback {
        ReactNativeMapboxGLModule module;

        OfflineRegionsInitialRequest(ReactNativeMapboxGLModule module) {
            this.module = module;
        }

        @Override
        public void onList(OfflineRegion[] offlineRegions) {
            for (OfflineRegion region : offlineRegions) {
                region.setObserver(new OfflineRegionProgressObserver(module, region));
                region.setDownloadState(OfflineRegion.STATE_ACTIVE);
            }
        }

        @Override
        public void onError(String error) {
            Log.e(module.getReactApplicationContext().getPackageName(), error);
        }
    }

    void initializeOfflinePacks() {
        final ReactNativeMapboxGLModule _this = this;
        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                OfflineManager.getInstance(context.getApplicationContext()).listOfflineRegions(
                        new OfflineRegionsInitialRequest(_this)
                );
            }
        });

    }

    // Offline pack listing

    static WritableMap serializeOfflineRegionStatus(OfflineRegion region, OfflineRegionStatus status) {
        WritableMap result = Arguments.createMap();

        try {
            ByteArrayInputStream bis = new ByteArrayInputStream(region.getMetadata());
            ObjectInputStream ois = new ObjectInputStream(bis);

            result.putString("name", (String)ois.readObject());
            result.putString("metadata", (String)ois.readObject());

            ois.close();
        } catch (Throwable e) {
            e.printStackTrace();
        }

        result.putInt("countOfBytesCompleted", (int)status.getCompletedResourceSize());
        result.putInt("countOfResourcesCompleted", (int)status.getCompletedResourceCount());
        result.putInt("countOfResourcesExpected", (int)status.getRequiredResourceCount());
        result.putInt("maximumResourcesExpected", (int)status.getRequiredResourceCount());

        return result;
    }

    static String getOfflineRegionName(OfflineRegion region) {
        try {
            ByteArrayInputStream bis = new ByteArrayInputStream(region.getMetadata());
            ObjectInputStream ois = new ObjectInputStream(bis);
            String name = (String)ois.readObject();
            ois.close();
            return name;
        } catch (Throwable e) {
            e.printStackTrace();
            return null;
        }
    }

    class OfflineRegionsRequest implements OfflineManager.ListOfflineRegionsCallback {
        Promise promise;
        int pendingCount;
        WritableArray responses;

        OfflineRegionsRequest(Promise promise) {
            this.promise = promise;
        }

        @Override
        public void onList(OfflineRegion[] offlineRegions) {
            pendingCount = offlineRegions.length;
            responses = Arguments.createArray();

            if (pendingCount == 0) {
                promise.resolve(responses);
                return;
            }

            for (OfflineRegion region : offlineRegions) {
                final OfflineRegion _region = region;
                final OfflineRegionsRequest _this = this;
                region.getStatus(new OfflineRegion.OfflineRegionStatusCallback() {
                    @Override
                    public void onStatus(OfflineRegionStatus status) {
                        _this.onStatus(_region, status);
                    }
                    @Override
                    public void onError(String error) {
                        _this.onError(error);
                    }
                });
            }
        }

        public void onStatus(OfflineRegion region, OfflineRegionStatus status) {
            WritableMap res = serializeOfflineRegionStatus(region, status);
            responses.pushMap(res);

            pendingCount--;
            if (pendingCount == 0) {
                promise.resolve(responses);
            }
        }

        @Override
        public void onError(String error) {
            promise.reject(new JSApplicationIllegalArgumentException(error));
        }
    }

    @ReactMethod
    public void getOfflinePacks(final Promise promise) {
        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                OfflineManager.getInstance(context.getApplicationContext()).listOfflineRegions(
                        new OfflineRegionsRequest(promise)
                );
            }
        });
    }

    // Offline pack insertion

    @ReactMethod
    public void addOfflinePack(ReadableMap options, final Promise promise) {
        if (!options.hasKey("name")) {
            promise.reject(new JSApplicationIllegalArgumentException("addOfflinePack(): name is required."));
            return;
        }
        if (!options.hasKey("minZoomLevel")) {
            promise.reject(new JSApplicationIllegalArgumentException("addOfflinePack(): minZoomLevel is required."));
            return;
        }
        if (!options.hasKey("maxZoomLevel")) {
            promise.reject(new JSApplicationIllegalArgumentException("addOfflinePack(): maxZoomLevel is required."));
            return;
        }
        if (!options.hasKey("bounds")) {
            promise.reject(new JSApplicationIllegalArgumentException("addOfflinePack(): bounds is required."));
            return;
        }
        if (!options.hasKey("styleURL")) {
            promise.reject(new JSApplicationIllegalArgumentException("addOfflinePack(): styleURL is required."));
            return;
        }
        if (!options.hasKey("type")) {
            promise.reject(new JSApplicationIllegalArgumentException("addOfflinePack(): type is required."));
            return;
        }
        if (!options.getString("type").equals("bbox")) {
            promise.reject(new JSApplicationIllegalArgumentException("addOfflinePack(): Offline pack type " +
                    options.getString("type") +
                    " not supported. Only \"bbox\" is currently supported."));
            return;
        }

        float pixelRatio = context.getResources().getDisplayMetrics().density;
        pixelRatio = pixelRatio < 1.5f ? 1.0f : 2.0f;

        ReadableArray boundsArray = options.getArray("bounds");
        LatLngBounds bounds = new LatLngBounds.Builder()
                .include(new LatLng(boundsArray.getDouble(0), boundsArray.getDouble(1)))
                .include(new LatLng(boundsArray.getDouble(2), boundsArray.getDouble(3)))
                .build();

        final OfflineTilePyramidRegionDefinition regionDef = new OfflineTilePyramidRegionDefinition(
                options.getString("styleURL"),
                bounds,
                options.getDouble("minZoomLevel"),
                options.getDouble("maxZoomLevel"),
                pixelRatio
        );

        byte [] metadata;

        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(bos);
            oos.writeObject(options.getString("name"));
            oos.writeObject(options.getString("metadata"));
            oos.close();
            metadata = bos.toByteArray();
        } catch (IOException e) {
            promise.reject(e);
            return;
        }

        final ReactNativeMapboxGLModule _this = this;
        final byte [] _metadata = metadata;
        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                OfflineManager.getInstance(context.getApplicationContext()).createOfflineRegion(
                        regionDef,
                        _metadata,
                        new OfflineManager.CreateOfflineRegionCallback() {
                            @Override
                            public void onCreate(OfflineRegion offlineRegion) {
                                offlineRegion.setObserver(new OfflineRegionProgressObserver(_this, offlineRegion));
                                offlineRegion.setDownloadState(OfflineRegion.STATE_ACTIVE);
                                promise.resolve(null);
                            }

                            @Override
                            public void onError(String error) {
                                promise.reject(new JSApplicationIllegalArgumentException(error));
                            }
                        }
                );
            }
        });
    }

    // Offline pack removal

    class OfflineRegionDummyObserver implements OfflineRegion.OfflineRegionObserver {

        @Override
        public void onStatusChanged(OfflineRegionStatus status) {

        }

        @Override
        public void onError(OfflineRegionError error) {

        }

        @Override
        public void mapboxTileCountLimitExceeded(long limit) {

        }
    }

    class OfflineRegionsDeleteRequest implements OfflineManager.ListOfflineRegionsCallback {
        Promise promise;
        String name;

        OfflineRegionsDeleteRequest(Promise promise, String name) {
            this.promise = promise;
            this.name = name;
        }

        @Override
        public void onList(OfflineRegion[] offlineRegions) {
            for (OfflineRegion region : offlineRegions) {
                String packName = getOfflineRegionName(region);

                if (packName != null && packName.equals(name)) {
                    region.setObserver(new OfflineRegionDummyObserver());
                    region.setDownloadState(OfflineRegion.STATE_INACTIVE);

                    final OfflineRegionsDeleteRequest _this = this;
                    region.delete(new OfflineRegion.OfflineRegionDeleteCallback() {
                        @Override
                        public void onDelete() {
                            WritableMap result = Arguments.createMap();
                            result.putString("deleted", _this.name);
                            _this.promise.resolve(result);
                        }

                        @Override
                        public void onError(String error) {
                            _this.onError(error);
                        }
                    });
                    return;
                }
            }

            promise.resolve(Arguments.createMap());
        }

        @Override
        public void onError(String error) {
            promise.reject(new JSApplicationIllegalArgumentException(error));
        }
    }

    @ReactMethod
    public void removeOfflinePack(final String packName, final Promise promise) {
        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                OfflineManager.getInstance(context.getApplicationContext()).listOfflineRegions(
                        new OfflineRegionsDeleteRequest(promise, packName)
                );
            }
        });
    }
}