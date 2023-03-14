package com.mapbox.rctmgl.modules

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.mapbox.rctmgl.modules.RCTMGLOfflineModule
import com.mapbox.rctmgl.modules.TileRegionPack
import com.mapbox.maps.OfflineManager
import com.mapbox.rctmgl.utils.LatLngBounds
import com.mapbox.maps.TilesetDescriptorOptions
import com.mapbox.rctmgl.utils.GeoJSONUtils
import com.mapbox.bindgen.Expected
import com.mapbox.geojson.Geometry
import com.mapbox.rctmgl.events.IEvent
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import com.mapbox.bindgen.Value
import com.mapbox.rctmgl.events.OfflineEvent
import com.mapbox.common.*
import com.mapbox.rctmgl.events.constants.EventTypes
import com.mapbox.geojson.FeatureCollection
import com.mapbox.turf.TurfMeasurement
import com.mapbox.maps.ResourceOptions
import com.mapbox.rctmgl.modules.RCTMGLModule
import com.mapbox.rctmgl.utils.ConvertUtils
import com.mapbox.rctmgl.utils.Logger
import org.json.JSONException
import org.json.JSONObject
import java.io.File
import java.io.UnsupportedEncodingException
import java.lang.Error
import java.nio.file.Files
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.ArrayList
import java.util.HashMap
import java.util.concurrent.CountDownLatch

class TileRegionPack(var name: String, var progress: TileRegionLoadProgress?, var state: String) {
    var cancelable: Cancelable? = null
    var loadOptions: TileRegionLoadOptions? = null

    companion object {
        val ACTIVE = "active"
        val INACTIVE = "inactive"
        val COMPLETE = "complete"
    }
}

@ReactModule(name = RCTMGLOfflineModule.REACT_CLASS)
class RCTMGLOfflineModule(private val mReactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(
        mReactContext
    ) {
    var tileRegionPacks = HashMap<String, TileRegionPack>()
    private var mProgressEventThrottle = 300.0
    override fun getName(): String {
        return REACT_CLASS
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Set up any upstream listeners or background tasks as necessary
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Remove upstream listeners, stop unnecessary background tasks
    }

    @ReactMethod
    @Throws(JSONException::class)
    fun createPack(options: ReadableMap, promise: Promise) {
        val name = ConvertUtils.getString("name", options, "")
        val offlineManager = getOfflineManager(mReactContext)
        val latLngBounds = getBoundsFromOptions(options)
        val descriptorOptions = TilesetDescriptorOptions.Builder().styleURI(
            (options.getString("styleURL"))!!
        ).minZoom(options.getInt("minZoom").toByte()).maxZoom(options.getInt("maxZoom").toByte())
            .build()
        val tilesetDescriptor = offlineManager!!.createTilesetDescriptor(descriptorOptions)
        val descriptors = ArrayList<TilesetDescriptor>()
        descriptors.add(tilesetDescriptor)
        val loadOptions = TileRegionLoadOptions.Builder()
            .geometry(GeoJSONUtils.fromLatLngBoundsToPolygon(latLngBounds))
            .descriptors(descriptors)
            .metadata(Value.valueOf((options.getString("metadata"))!!))
            .acceptExpired(true)
            .networkRestriction(NetworkRestriction.NONE)
            .build()
        val metadataStr = options.getString("metadata")
        val metadata = JSONObject(metadataStr)
        val id = metadata.getString("name")
        val pack = TileRegionPack(id, null, TileRegionPack.INACTIVE)
        pack.loadOptions = loadOptions
        tileRegionPacks[id] = pack
        promise.resolve(fromOfflineRegion(latLngBounds, metadataStr))
        startPackDownload(pack)
    }

    fun startPackDownload(pack: TileRegionPack) {
        val _this = this
        pack.cancelable = getTileStore()!!
            .loadTileRegion(
                pack.name,
                (pack.loadOptions)!!,
                TileRegionLoadProgressCallback { progress ->
                    pack.progress = progress
                    pack.state = TileRegionPack.ACTIVE
                    _this.sendEvent(_this.makeStatusEvent(pack.name, progress, pack))
                },
                object : TileRegionCallback {
                    override fun run(region: Expected<TileRegionError, TileRegion>) {
                        pack.cancelable = null
                        if (region.isError) {
                            pack.state = TileRegionPack.INACTIVE
                            _this.sendEvent(
                                _this.makeErrorEvent(
                                    pack.name, "TileRegionError", region.error!!
                                        .message
                                )
                            )
                        } else {
                            pack.state = TileRegionPack.COMPLETE
                            _this.sendEvent(_this.makeStatusEvent(pack.name, pack.progress, pack))
                        }
                    }
                })
    }

    @ReactMethod
    fun getPacks(promise: Promise) {
        getTileStore()!!.getAllTileRegions(object : TileRegionsCallback {
            override fun run(regions: Expected<TileRegionError, List<TileRegion>>) {
                UiThreadUtil.runOnUiThread(object : Runnable {
                    override fun run() {
                        if (regions.isValue) {
                            convertRegionsToJSON((regions.value)!!, promise)
                        } else {
                            promise.reject("getPacks", regions.error!!.message)
                        }
                    }
                })
            }
        })
    }

    private fun convertRegionsToJSON(tileRegions: List<TileRegion>, promise: Promise) {
        val countDownLatch = CountDownLatch(tileRegions.size)
        val errors = ArrayList<TileRegionError?>()
        val geometries = ArrayList<Geometry>()
        try {
            for (region: TileRegion in tileRegions) {
                getTileStore()!!
                    .getTileRegionGeometry(region.id, object : TileRegionGeometryCallback {
                        override fun run(result: Expected<TileRegionError, Geometry>) {
                            if (result.isValue) {
                                geometries.add(result.value!!)
                            } else {
                                errors.add(result.error)
                            }
                            countDownLatch.countDown()
                        }
                    })
            }
        } catch (error: Error) {
            Logger.e("OS", "a")
        }
        try {
            countDownLatch.await()
            val result = Arguments.createArray()
            for (geometry: Geometry in geometries) {
                result.pushMap(fromOfflineRegion(geometry))
            }
            for (error: TileRegionError? in errors) {
                val errorMap = Arguments.createMap()
                errorMap.putString("type", "error")
                errorMap.putString("message", error!!.message)
                errorMap.putString("errorType", error.type.toString())
                result.pushMap(errorMap)
            }
            promise.resolve(
                result
            )
        } catch (interruptedException: InterruptedException) {
            promise.reject(interruptedException)
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
    fun getPackStatus(name: String, promise: Promise) {
        val pack = tileRegionPacks[name]
        if (pack != null) {
            promise.resolve(makeRegionStatus(name, pack.progress, pack))
        } else {
            promise.reject(Error("Pack not found"))
            Logger.w(REACT_CLASS, "getPackStatus - Unknown offline region")
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

    @ReactMethod
    fun deletePack(name: String, promise: Promise) {
        getTileStore()!!.getAllTileRegions{ expected ->
            if (expected.isValue) {
                expected.value?.let { tileRegionList ->
                    var downloadedRegionExists = false;
                    for (tileRegion in tileRegionList) {
                        if (tileRegion.id == name) {
                            downloadedRegionExists = true;
                            getTileStore()!!.removeTileRegion(name, object : TileRegionCallback {
                                override fun run(region: Expected<TileRegionError, TileRegion>) {
                                    promise.resolve(null);
                                }
                            })
                        }
                    }
                    if (!downloadedRegionExists) {
                        promise.resolve(null);
                    }
                }
            }
            expected.error?.let { tileRegionError ->
                promise.reject("deletePack", "TileRegionError: $tileRegionError")
            }
        }
    }

    @ReactMethod
    fun migrateOfflineCache() {

        // Old and new cache file paths
        val targetPathName = mReactContext.filesDir.absolutePath + "/.mapbox/map_data"
        val sourcePath = Paths.get(mReactContext.filesDir.absolutePath + "/mbgl-offline.db")
        val targetPath = Paths.get(targetPathName + "/map_data.db")

        try {
            val directory = File(targetPathName)
            directory.mkdirs()
            Files.move(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING)
            Log.d("TAG","v10 cache directory created successfully")
        } catch (e: Exception) {
            Log.d("TAG", "${e}... file move unsuccessful")
        }
    }

    @ReactMethod
    fun pausePackDownload(name: String, promise: Promise) {
        val pack = tileRegionPacks[name]
        if (pack != null) {
            if (pack.cancelable != null) {
                pack.cancelable!!.cancel()
                pack.cancelable = null
                promise.resolve(null)
            } else {
                promise.reject("resumeRegionDownload", "Offline region cancelled already")
            }
        } else {
            promise.reject("resumeRegionDownload", "Unknown offline region")
        }
    }

    @ReactMethod
    fun resumePackDownload(name: String, promise: Promise) {
        val pack = tileRegionPacks[name]
        if (pack != null) {
            startPackDownload(pack)
            promise.resolve(null)
        } else {
            promise.reject("resumeRegionDownload", "Unknown offline region")
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
    fun setTileCountLimit(tileCountLimit: Int) {
        val offlineManager = getOfflineManager(mReactContext)
        //v10todo
        //offlineManager.setOfflineMapboxTileCountLimit(tileCountLimit);
    }

    @ReactMethod
    fun setProgressEventThrottle(eventThrottle: Double) {
        mProgressEventThrottle = eventThrottle
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
    private fun getMetadataBytes(metadata: String?): ByteArray? {
        var metadataBytes: ByteArray? = null
        if (metadata == null || metadata.isEmpty()) {
            return metadataBytes
        }
        try {
            metadataBytes = metadata.toByteArray(charset("utf-8"))
        } catch (e: UnsupportedEncodingException) {
            Log.w(REACT_CLASS, e.localizedMessage)
        }
        return metadataBytes
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
    private fun sendEvent(event: IEvent) {
        val eventEmitter = eventEmitter
        eventEmitter.emit(event.key, event.toJSON())
    }

    private val eventEmitter: RCTNativeAppEventEmitter
        private get() = mReactContext.getJSModule(RCTNativeAppEventEmitter::class.java)

    private fun makeErrorEvent(
        regionName: String,
        errorType: String,
        message: String
    ): OfflineEvent {
        val payload: WritableMap = WritableNativeMap()
        payload.putString("message", message)
        payload.putString("name", regionName)
        return OfflineEvent(OFFLINE_ERROR, errorType, payload)
    }

    private fun makeStatusEvent(
        regionName: String,
        status: TileRegionLoadProgress?,
        pack: TileRegionPack
    ): OfflineEvent {
        return OfflineEvent(
            OFFLINE_PROGRESS,
            EventTypes.OFFLINE_STATUS,
            makeRegionStatus(regionName, status, pack)
        )
    }

    private fun makeRegionStatus(
        regionName: String,
        status: TileRegionLoadProgress?,
        pack: TileRegionPack
    ): WritableMap {
        val map = Arguments.createMap()
        val progressPercentage =
            (status!!.completedResourceCount.toDouble() * 100.0) / (status.requiredResourceCount.toDouble())
        map.putString("name", regionName)
        map.putString("state", pack.state)
        map.putDouble("percentage", progressPercentage)
        map.putInt("completedResourceCount", status.completedResourceCount.toInt())
        map.putInt("completedResourceSize", status.completedResourceSize.toInt())
        map.putInt("erroredResourceCount", status.erroredResourceCount.toInt())
        map.putInt("requiredResourceCount", status.requiredResourceCount.toInt())
        map.putInt("loadedResourceCount", status.loadedResourceCount.toInt())
        map.putInt("loadedResourceSize", status.loadedResourceSize.toInt())
        return map
    }

    private fun getBoundsFromOptions(options: ReadableMap): LatLngBounds {
        val featureCollectionJSONStr = ConvertUtils.getString("bounds", options, "{}")
        val featureCollection = FeatureCollection.fromJson(featureCollectionJSONStr)
        return GeoJSONUtils.toLatLngBounds(featureCollection)
    }

    private fun fromOfflineRegion(bounds: LatLngBounds, metadataStr: String?): WritableMap {
        val map = Arguments.createMap()
        map.putArray("bounds", GeoJSONUtils.fromLatLngBounds(bounds))
        map.putString("metadata", metadataStr)
        return map
    }

    private fun fromOfflineRegion(region: Geometry): WritableMap {
        val map = Arguments.createMap()
        val bbox = TurfMeasurement.bbox(region)
        val bounds = Arguments.createArray()
        for (d: Double in bbox) {
            bounds.pushDouble(d)
        }
        map.putArray("bounds", bounds)
        map.putMap("geometry", GeoJSONUtils.fromGeometry(region))

        //map.putString("metadata", new String(region.getMetadata()));
        return map
    } /*
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
    companion object {
        const val REACT_CLASS = "RCTMGLOfflineModule"
        @JvmField
        val INACTIVE_REGION_DOWNLOAD_STATE = TileRegionPack.INACTIVE
        @JvmField
        val ACTIVE_REGION_DOWNLOAD_STATE = TileRegionPack.ACTIVE
        @JvmField
        val COMPLETE_REGION_DOWNLOAD_STATE = TileRegionPack.COMPLETE
        @JvmField
        val OFFLINE_ERROR = "MapboxOfflineRegionError"
        @JvmField
        val OFFLINE_PROGRESS = "MapboxOfflineRegionProgress"

        //    public static final String DEFAULT_STYLE_URL = Style.MAPBOX_STREETS;
        val DEFAULT_MIN_ZOOM_LEVEL = 10.0
        val DEFAULT_MAX_ZOOM_LEVEL = 20.0
        var offlineManager: OfflineManager? = null
        var _tileStore: TileStore? = null
        fun getOfflineManager(mReactContext: ReactApplicationContext?): OfflineManager? {
            if (offlineManager == null) {
                offlineManager = OfflineManager(
                    ResourceOptions.Builder()
                        .accessToken(RCTMGLModule.getAccessToken(mReactContext)).tileStore(
                        getTileStore()
                    ).build()
                )
            }
            return offlineManager
        }

        fun getTileStore(): TileStore? {
            if (_tileStore == null) {
                _tileStore = TileStore.create()
                return _tileStore
            }
            return _tileStore
        }
    }
}