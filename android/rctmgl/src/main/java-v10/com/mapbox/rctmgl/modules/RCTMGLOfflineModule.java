package com.mapbox.rctmgl.modules;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

import android.os.Handler;
import android.os.Looper;
import android.util.JsonReader;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.mapbox.bindgen.Expected;
import com.mapbox.bindgen.Value;
import com.mapbox.common.Cancelable;
import com.mapbox.common.NetworkRestriction;
import com.mapbox.common.TileRegion;
import com.mapbox.common.TileRegionCallback;
import com.mapbox.common.TileRegionError;
import com.mapbox.common.TileRegionGeometryCallback;
import com.mapbox.common.TileRegionLoadOptions;
import com.mapbox.common.TileRegionLoadProgress;
import com.mapbox.common.TileRegionLoadProgressCallback;
import com.mapbox.common.TileRegionsCallback;
import com.mapbox.common.TileStore;
import com.mapbox.common.TileStoreOptions;
import com.mapbox.common.TilesetDescriptor;
import com.mapbox.common.ValueConverter;
import com.mapbox.geojson.BoundingBox;
import com.mapbox.geojson.FeatureCollection;

import com.mapbox.geojson.Geometry;
import com.mapbox.geojson.Point;
import com.mapbox.maps.OfflineManager;
import com.mapbox.maps.ResourceOptions;
import com.mapbox.maps.StylePackLoadOptions;
import com.mapbox.maps.TileStoreUsageMode;
import com.mapbox.maps.TilesetDescriptorOptions;
import com.mapbox.rctmgl.events.IEvent;
import com.mapbox.rctmgl.events.OfflineEvent;
import com.mapbox.rctmgl.events.constants.EventTypes;
import com.mapbox.rctmgl.utils.ConvertUtils;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.rctmgl.utils.LatLngBounds;
import com.mapbox.rctmgl.utils.Logger;
import com.mapbox.rctmgl.utils.ReadableMapToValue;
import com.mapbox.turf.TurfMeasurement;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CountDownLatch;


class TileRegionPack {
    final static String ACTIVE = "active";
    final static String INACTIVE = "inactive";
    final static String COMPLETE = "complete";
    public String name;
    public TileRegionLoadProgress progress;
    public String state;
    public Cancelable cancelable;
    public TileRegionLoadOptions loadOptions;

    TileRegionPack(String name, TileRegionLoadProgress progress, String state) {
        this.name = name;
        this.progress = progress;
        this.state = state;
    }
}

@ReactModule(name = RCTMGLOfflineModule.REACT_CLASS)
public class RCTMGLOfflineModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "RCTMGLOfflineModule";

    public static final String INACTIVE_REGION_DOWNLOAD_STATE = TileRegionPack.INACTIVE; 
    public static final String ACTIVE_REGION_DOWNLOAD_STATE = TileRegionPack.ACTIVE;

    public static final String COMPLETE_REGION_DOWNLOAD_STATE = TileRegionPack.COMPLETE;

    public static final String OFFLINE_ERROR = "MapboxOfflineRegionError";
    public static final String OFFLINE_PROGRESS = "MapboxOfflineRegionProgress";

//    public static final String DEFAULT_STYLE_URL = Style.MAPBOX_STREETS;
    public static final Double DEFAULT_MIN_ZOOM_LEVEL = 10.0;
    public static final Double DEFAULT_MAX_ZOOM_LEVEL = 20.0;

    public HashMap<String, TileRegionPack> tileRegionPacks = new HashMap<>();

    private ReactApplicationContext mReactContext;
    private Double mProgressEventThrottle = 300.0;

    static OfflineManager offlineManager = null;
    static TileStore tileStore = null;

    public RCTMGLOfflineModule(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
        mReactContext = reactApplicationContext;
    }

    @Override
    public String getName () {
        return REACT_CLASS;
    }

    static public OfflineManager getOfflineManager(ReactApplicationContext mReactContext) {
        if (offlineManager == null) {
            offlineManager = new OfflineManager(new ResourceOptions.Builder().accessToken (RCTMGLModule.getAccessToken(mReactContext)).tileStore(getTileStore()).build() );
        }
        return offlineManager;
    }

    static public TileStore getTileStore() {
        if (tileStore == null) {
            tileStore = TileStore.create();
            return tileStore;
        }
        return tileStore;
    }

    @ReactMethod
    public void createPack(ReadableMap options, final Promise promise) throws JSONException {
        final String name = ConvertUtils.getString("name", options, "");
        final OfflineManager offlineManager = RCTMGLOfflineModule.getOfflineManager(mReactContext);
        LatLngBounds latLngBounds = getBoundsFromOptions(options);

        TilesetDescriptorOptions descriptorOptions = new TilesetDescriptorOptions.Builder().
                styleURI(options.getString("styleURL")).
                minZoom((byte)options.getInt("minZoom")).
                maxZoom((byte)options.getInt("maxZoom")).build();

        TilesetDescriptor tilesetDescriptor = offlineManager.createTilesetDescriptor(descriptorOptions);
        ArrayList<TilesetDescriptor> descriptors = new ArrayList<>();
        descriptors.add(tilesetDescriptor);


        TileRegionLoadOptions loadOptions = new TileRegionLoadOptions.Builder()
                .geometry(GeoJSONUtils.fromLatLngBoundsToPolygon(latLngBounds))
                .descriptors(descriptors)
                .metadata(Value.valueOf(options.getString("metadata")))
                .acceptExpired(true)
                .networkRestriction(NetworkRestriction.NONE)
                .build();

        String metadataStr = options.getString("metadata");
        JSONObject metadata = new JSONObject(metadataStr);
        String id = metadata.getString("name");
        TileRegionPack pack = new TileRegionPack(id, null, TileRegionPack.INACTIVE);
        pack.loadOptions = loadOptions;
        tileRegionPacks.put(id, pack);

        promise.resolve(fromOfflineRegion(latLngBounds, metadataStr));

        startPackDownload(pack);
    }

    void startPackDownload(TileRegionPack pack) {
        RCTMGLOfflineModule _this = this;
        pack.cancelable = getTileStore().loadTileRegion(pack.name, pack.loadOptions, new TileRegionLoadProgressCallback() {
            @Override
            public void run(@NonNull TileRegionLoadProgress progress) {
                pack.progress = progress;
                pack.state = TileRegionPack.ACTIVE;
                _this.sendEvent(_this.makeStatusEvent(pack.name, progress, pack));
            }
        }, new TileRegionCallback() {
            @Override
            public void run(@NonNull Expected<TileRegionError, TileRegion> region) {
                pack.cancelable = null;
                if (region.isError()) {
                    pack.state = TileRegionPack.INACTIVE;
                    _this.sendEvent(_this.makeErrorEvent(pack.name, "TileRegionError", region.getError().getMessage()));
                } else {
                    pack.state = TileRegionPack.COMPLETE;
                    _this.sendEvent(_this.makeStatusEvent(pack.name, pack.progress, pack));
                }
            }
        });
    }

    @ReactMethod
    public void getPacks(final Promise promise) {
        getTileStore().getAllTileRegions(new TileRegionsCallback() {
            @Override
            public void run(@NonNull Expected<TileRegionError, List<TileRegion>> regions) {
                runOnUiThread(new Runnable() {
                   @Override
                    public void run() {
                       if (regions.isValue()) {
                           convertRegionsToJSON(regions.getValue(), promise);
                       } else {
                           promise.reject("getPacks", regions.getError().getMessage());
                       }
                    }
                });

            }
        });
    }

    private void convertRegionsToJSON(List<TileRegion> tileRegions, Promise promise) {
        CountDownLatch countDownLatch = new CountDownLatch(tileRegions.size());
        ArrayList<TileRegionError> errors = new ArrayList<>();
        ArrayList<Geometry> geometries = new ArrayList<>();
        try {
            for (TileRegion region : tileRegions) {
                getTileStore().getTileRegionGeometry(region.getId(), new TileRegionGeometryCallback() {
                    @Override
                    public void run(@NonNull Expected<TileRegionError, Geometry> result) {
                        if (result.isValue()) {
                            geometries.add(result.getValue());
                        } else {
                            errors.add(result.getError());
                        }
                        countDownLatch.countDown();
                    }
                });
            }
        } catch(Error error) {
            Logger.e("OS", "a");
        }
        try {
            countDownLatch.await();
            WritableArray result = Arguments.createArray();
            for (Geometry geometry: geometries) {
                result.pushMap(fromOfflineRegion(geometry));
            }
            for (TileRegionError error: errors) {
                WritableMap errorMap = Arguments.createMap();
                errorMap.putString("type","error");
                errorMap.putString("message", error.getMessage());
                errorMap.putString("errorType", error.getType().toString());
                result.pushMap(errorMap);
            }
            promise.resolve(
                result
            );
        } catch (InterruptedException interruptedException) {
            promise.reject(interruptedException);
        }

    }

    /*
    @ReactMethod
    public void invalidateAmbientCache(final Promise promise) {
        activateFileSource();
        final OfflineManager offlineManager = OfflineManager.getInstance(mReactContext);
        offlineManager.invalidateAmbientCache(new OfflineManager.FileSourceCallback() {
            @Override
            public void onSuccess() {
                promise.resolve(null);
            }

            @Override
            public void onError(String error) {
                promise.reject("invalidateAmbientCache", error);
            }
        });
    }

    @ReactMethod
    public void clearAmbientCache(final Promise promise) {
        activateFileSource();

        final OfflineManager offlineManager = OfflineManager.getInstance(mReactContext);

        offlineManager.clearAmbientCache(new OfflineManager.FileSourceCallback() {
            @Override
            public void onSuccess() {
                promise.resolve(null);
            }

            @Override
            public void onError(String error) {
                promise.reject("clearAmbientCache", error);
            }
        });
    }

    @ReactMethod
    public void setMaximumAmbientCacheSize(int size, final Promise promise) {
        activateFileSource();

        final OfflineManager offlineManager = OfflineManager.getInstance(mReactContext);

        offlineManager.setMaximumAmbientCacheSize(size, new OfflineManager.FileSourceCallback() {
            @Override
            public void onSuccess() {
                promise.resolve(null);
            }

            @Override
            public void onError(String error) {
                promise.reject("setMaximumAmbientCacheSize", error);
            }
        });
    }*/

/*
    @ReactMethod
    public void resetDatabase(final Promise promise) {
        activateFileSource();
        final OfflineManager offlineManager = OfflineManager.getInstance(mReactContext);
        offlineManager.resetDatabase(new OfflineManager.FileSourceCallback() {
            @Override
            public void onSuccess() {
                promise.resolve(null);
            }

            @Override
            public void onError(String error) {
                promise.reject("resetDatabase", error);
            }
        });
    }*/

    @ReactMethod
    public void getPackStatus(final String name, final Promise promise) {
        TileRegionPack pack = this.tileRegionPacks.get(name);
        if (pack != null) {
            promise.resolve(makeRegionStatus(name, pack.progress, pack));
        } else {
            promise.reject(new Error("Pack not found"));
            Logger.w(REACT_CLASS, "getPackStatus - Unknown offline region");
        }
    }

    /*
    @ReactMethod
    public void setPackObserver(final String name, final Promise promise) {
        activateFileSource();

        final OfflineManager offlineManager = OfflineManager.getInstance(mReactContext);

        offlineManager.listOfflineRegions(new OfflineManager.ListOfflineRegionsCallback() {
            @Override
            public void onList(OfflineRegion[] offlineRegions) {
                OfflineRegion region = getRegionByName(name, offlineRegions);
                boolean hasRegion = region != null;

                if (hasRegion) {
                    setOfflineRegionObserver(name, region);
                }

                promise.resolve(hasRegion);
            }

            @Override
            public void onError(String error) {
                promise.reject("setPackObserver", error);
            }
        });
    }*/

    /*
    @ReactMethod
    public void invalidatePack(final String name, final Promise promise) {
        activateFileSource();

        final OfflineManager offlineManager = OfflineManager.getInstance(mReactContext);

        offlineManager.listOfflineRegions(new OfflineManager.ListOfflineRegionsCallback() {
            @Override
            public void onList(OfflineRegion[] offlineRegions) {
                OfflineRegion region = getRegionByName(name, offlineRegions);

                if (region == null) {
                    promise.resolve(null);
                    Log.w(REACT_CLASS, "invalidateRegion - Unknown offline region");
                    return;
                }

                region.invalidate(new OfflineRegion.OfflineRegionInvalidateCallback() {
                    @Override
                    public void onInvalidate() {
                        promise.resolve(null);
                    }

                    @Override
                    public void onError(String error) {
                        promise.reject("invalidateRegion", error);
                    }
                });
            }

            @Override
            public void onError(String error) {
                promise.reject("invalidateRegion", error);
            }
        });
    }*/

    /*
    @ReactMethod
    public void deletePack(final String name, final Promise promise) {
        activateFileSource();

        final OfflineManager offlineManager = OfflineManager.getInstance(mReactContext);

        offlineManager.listOfflineRegions(new OfflineManager.ListOfflineRegionsCallback() {
            @Override
            public void onList(OfflineRegion[] offlineRegions) {
                OfflineRegion region = getRegionByName(name, offlineRegions);

                if (region == null) {
                    promise.resolve(null);
                    Log.w(REACT_CLASS, "deleteRegion - Unknown offline region");
                    return;
                }

                // stop download before deleting (https://github.com/mapbox/mapbox-gl-native/issues/12382#issuecomment-431055103)
                region.setDownloadState(INACTIVE_REGION_DOWNLOAD_STATE);

                region.delete(new OfflineRegion.OfflineRegionDeleteCallback() {
                    @Override
                    public void onDelete() {
                        promise.resolve(null);
                    }

                    @Override
                    public void onError(String error) {
                        promise.reject("deleteRegion", error);
                    }
                });
            }

            @Override
            public void onError(String error) {
                promise.reject("deleteRegion", error);
            }
        });
    }*/

    @ReactMethod
    public void pausePackDownload(final String name, final Promise promise) {
        TileRegionPack pack = this.tileRegionPacks.get(name);
        if (pack != null) {
            if (pack.cancelable != null) {
                pack.cancelable.cancel();
                pack.cancelable = null;
                promise.resolve(null);
            } else {
                promise.reject("resumeRegionDownload", "Offline region cancelled already");
            }
        } else {
            promise.reject("resumeRegionDownload", "Unknown offline region");
        }
    }

    @ReactMethod
    public void resumePackDownload(final String name, final Promise promise) {
        TileRegionPack pack = this.tileRegionPacks.get(name);
        if (pack != null) {
            startPackDownload(pack);
            promise.resolve(null);
        } else {
            promise.reject("resumeRegionDownload", "Unknown offline region");
        }
    }
/*
    @ReactMethod
    public void mergeOfflineRegions(final String path, final Promise promise) {
        activateFileSource();

        final OfflineManager offlineManager = OfflineManager.getInstance(mReactContext);

        offlineManager.mergeOfflineRegions(path, new OfflineManager.MergeOfflineRegionsCallback() {
            @Override
            public void onMerge(OfflineRegion[] offlineRegions) {
                promise.resolve(null);
            }

            @Override
            public void onError(String error) {
                promise.reject("mergeOfflineRegions", error);
            }
        });
    }*/

    @ReactMethod
    public void setTileCountLimit(int tileCountLimit) {
        OfflineManager offlineManager = getOfflineManager(mReactContext);
        //v10todo
        //offlineManager.setOfflineMapboxTileCountLimit(tileCountLimit);
    }

    @ReactMethod
    public void setProgressEventThrottle(double eventThrottle) {
        mProgressEventThrottle = eventThrottle;
    }
/*
    private OfflineRegionDefinition makeDefinition(LatLngBounds latLngBounds, ReadableMap options) {
        return new OfflineTilePyramidRegionDefinition(
                ConvertUtils.getString("styleURL", options, DEFAULT_STYLE_URL),
                latLngBounds,
                ConvertUtils.getDouble("minZoom", options, DEFAULT_MIN_ZOOM_LEVEL),
                ConvertUtils.getDouble("maxZoom", options, DEFAULT_MAX_ZOOM_LEVEL),
                mReactContext.getResources().getDisplayMetrics().density);
    }*/

    private byte[] getMetadataBytes(String metadata) {
        byte[] metadataBytes = null;

        if (metadata == null || metadata.isEmpty()) {
            return metadataBytes;
        }

        try {
            metadataBytes = metadata.getBytes("utf-8");
        } catch (UnsupportedEncodingException e) {
            Log.w(REACT_CLASS, e.getLocalizedMessage());
        }

        return metadataBytes;
    }

    /*
    private void setOfflineRegionObserver(final String name, final OfflineRegion region) {
        region.setObserver(new OfflineRegion.OfflineRegionObserver() {
            OfflineRegionStatus prevStatus = null;
            long timestamp = System.currentTimeMillis();

            @Override
            public void onStatusChanged(OfflineRegionStatus status) {
                if (shouldSendUpdate(System.currentTimeMillis(), status)) {
                    sendEvent(makeStatusEvent(name, status));
                    timestamp = System.currentTimeMillis();
                }
                prevStatus = status;
            }

            @Override
            public void onError(OfflineRegionError error) {
                sendEvent(makeErrorEvent(name, EventTypes.OFFLINE_ERROR, error.getMessage()));
            }

            @Override
            public void mapboxTileCountLimitExceeded(long limit) {
                String message = String.format(Locale.getDefault(), "Mapbox tile limit exceeded %d", limit);
                sendEvent(makeErrorEvent(name, EventTypes.OFFLINE_TILE_LIMIT, message));
            }

            private boolean shouldSendUpdate (long currentTimestamp, OfflineRegionStatus curStatus) {
                if (prevStatus == null) {
                    return false;
                }

                if (prevStatus.getDownloadState() != curStatus.getDownloadState()) {
                    return true;
                }

                if (currentTimestamp - timestamp > mProgressEventThrottle) {
                    return true;
                }

                return false;
            }
        });

        region.setDownloadState(ACTIVE_REGION_DOWNLOAD_STATE);
    }*/

    private void sendEvent(IEvent event) {
        RCTNativeAppEventEmitter eventEmitter = getEventEmitter();
        eventEmitter.emit(event.getKey(), event.toJSON());
    }

    private RCTNativeAppEventEmitter getEventEmitter() {
        return mReactContext.getJSModule(RCTNativeAppEventEmitter.class);
    }

    private OfflineEvent makeErrorEvent(String regionName, String errorType, String message) {
        WritableMap payload = new WritableNativeMap();
        payload.putString("message", message);
        payload.putString("name", regionName);
        return new OfflineEvent(OFFLINE_ERROR, errorType, payload);
    }


    private OfflineEvent makeStatusEvent(String regionName, TileRegionLoadProgress status, TileRegionPack pack) {
        return new OfflineEvent(OFFLINE_PROGRESS, EventTypes.OFFLINE_STATUS, makeRegionStatus(regionName, status, pack));
    }

    private WritableMap makeRegionStatus(String regionName, TileRegionLoadProgress status, TileRegionPack pack) {
        WritableMap map = Arguments.createMap();
        double progressPercentage = ((double)status.getCompletedResourceCount()*100.0) / ((double)status.getRequiredResourceCount());

        map.putString("name", regionName);
        map.putString("state", pack.state);
        map.putDouble("percentage", progressPercentage);
        map.putInt("completedResourceCount", (int)status.getCompletedResourceCount());
        map.putInt("completedResourceSize", (int)status.getCompletedResourceSize());
        map.putInt("erroredResourceCount", (int)status.getErroredResourceCount());
        map.putInt("requiredResourceCount", (int)status.getRequiredResourceCount());
        map.putInt("loadedResourceCount", (int)status.getLoadedResourceCount());
        map.putInt("loadedResourceSize", (int)status.getLoadedResourceSize());

        return map;
    }

    private LatLngBounds getBoundsFromOptions(ReadableMap options) {
        String featureCollectionJSONStr = ConvertUtils.getString("bounds", options, "{}");
        FeatureCollection featureCollection = FeatureCollection.fromJson(featureCollectionJSONStr);
        return GeoJSONUtils.toLatLngBounds(featureCollection);
    }

    private WritableMap fromOfflineRegion(LatLngBounds bounds, String metadataStr) {
        WritableMap map = Arguments.createMap();
        map.putArray("bounds", GeoJSONUtils.fromLatLngBounds(bounds));
        map.putString("metadata", metadataStr);
        return map;
    }

    private WritableMap fromOfflineRegion(Geometry region) {
        WritableMap map = Arguments.createMap();
        double[] bbox = TurfMeasurement.bbox(region);

        WritableArray bounds = Arguments.createArray();
        for (double d: bbox) {
            bounds.pushDouble(d);
        }
        map.putArray("bounds", bounds);
        map.putMap("geometry", GeoJSONUtils.fromGeometry(region));

        //map.putString("metadata", new String(region.getMetadata()));
        return map;
    }
/*
    private OfflineRegion getRegionByName(String name, OfflineRegion[] offlineRegions) {
        if (name == null || name.isEmpty()) {
            return null;
        }

        for (OfflineRegion region : offlineRegions) {
            boolean isRegion = false;

            try {
                byte[] byteMetadata = region.getMetadata();

                if (byteMetadata != null) {
                    JSONObject metadata = new JSONObject(new String(byteMetadata));
                    isRegion = name.equals(metadata.getString("name"));
                }
            } catch (JSONException e) {
                Log.w(REACT_CLASS, e.getLocalizedMessage());
            }

            if (isRegion) {
                return region;
            }
        }

        return null;
    }*/

    /*
    private void activateFileSource() {
        FileSource fileSource = FileSource.getInstance(mReactContext);
        fileSource.activate();
    }*/
}
