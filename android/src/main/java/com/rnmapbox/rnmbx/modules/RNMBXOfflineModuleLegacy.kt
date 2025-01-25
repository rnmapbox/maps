package com.rnmapbox.rnmbx.modules

import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import com.mapbox.bindgen.Expected
import com.mapbox.bindgen.Value
import com.mapbox.common.*
import com.mapbox.geojson.*
import com.mapbox.maps.CoordinateBounds
import com.mapbox.maps.GlyphsRasterizationMode
import com.mapbox.maps.OfflineRegion
import com.mapbox.maps.OfflineRegionCallback
import com.mapbox.maps.OfflineRegionCreateCallback
import com.mapbox.maps.OfflineRegionDownloadState
import com.mapbox.maps.OfflineRegionManager
import com.mapbox.maps.OfflineRegionStatus
import com.mapbox.maps.OfflineRegionTilePyramidDefinition
import com.mapbox.maps.OfflineRegionObserver
import com.mapbox.maps.OfflineRegionError
import com.mapbox.maps.OfflineRegionErrorType
import com.rnmapbox.rnmbx.events.IEvent
import com.rnmapbox.rnmbx.events.OfflineEvent
import com.rnmapbox.rnmbx.events.constants.EventTypes
import com.rnmapbox.rnmbx.utils.*
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.utils.extensions.*
import com.rnmapbox.rnmbx.utils.ConvertUtils
import com.rnmapbox.rnmbx.utils.extensions.toGeometryCollection
import com.rnmapbox.rnmbx.utils.writableArrayOf
import com.rnmapbox.rnmbx.v11compat.offlinemanager.getOfflineRegionManager
import kotlin.math.min
import kotlin.math.ceil
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.io.File
import java.io.UnsupportedEncodingException
import java.nio.file.Files
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import kotlin.math.ceil
import java.util.concurrent.TimeUnit

class TimeoutHandler(
        private val name: String,
        private val timeoutDuration: Long = TimeUnit.SECONDS.toMillis(30L),
        private val onTimeout: (String, Long) -> Unit
) {
    private val handler = Handler(Looper.getMainLooper())
    private var timeoutRunnable: Runnable? = null

    private fun startTimeout(){
        cancelTimeout()

        timeoutRunnable = Runnable {
            onTimeout(name, timeoutDuration)
        }.also {
            handler.postDelayed(it, timeoutDuration)
        }
    }
    private fun cancelTimeout(){
        timeoutRunnable?.let { handler.removeCallbacks(it) }
        timeoutRunnable = null
    }

    fun start() {
        Log.d(RNMBXOfflineModuleLegacy.LOG_TAG, "TimeoutHandler start:")
        startTimeout()
    }
    fun reset() {
        Log.d(RNMBXOfflineModuleLegacy.LOG_TAG, "TimeoutHandler reset:")
        startTimeout()
    }

    fun cancel() {
        Log.d(RNMBXOfflineModuleLegacy.LOG_TAG, "TimeoutHandler cancel:")
        cancelTimeout()
    }
}

@ReactModule(name = RNMBXOfflineModuleLegacy.REACT_CLASS)
class RNMBXOfflineModuleLegacy(private val mReactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(
                mReactContext
        ) {

    enum class State {
        INVALID, INACTIVE, ACTIVE, COMPLETE, INCOMPLETE, UNKNOWN
    }

    private var progressEventThrottle = ProgressEventThrottle(
            waitBetweenEvents = 300.0,
            lastSentTimestamp = null,
            lastSentState = null
    )

    private data class ProgressEventThrottle(
            var waitBetweenEvents: Double?,
            var lastSentTimestamp: Double?,
            var lastSentState: State?
    )

    private var defaultTimeoutInterval: Long = TimeUnit.SECONDS.toMillis(30L)

    override fun getName(): String {
        return REACT_CLASS
    }

    val offlineRegionManager: OfflineRegionManager by lazy {
        getOfflineRegionManager {
            RNMBXModule.getAccessToken(mReactContext)
        }
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Set up any upstream listeners or background tasks as necessary
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Remove upstream listeners, stop unnecessary background tasks
    }

    private fun makeDefinition(
            bounds: CoordinateBounds,
            options: ReadableMap
    ): OfflineRegionTilePyramidDefinition {
        return OfflineRegionTilePyramidDefinition.Builder()
                .styleURL(ConvertUtils.getString("styleURL", options, DEFAULT_STYLE_URL))
                .bounds(bounds)
                .minZoom(ConvertUtils.getDouble("minZoom", options, DEFAULT_MIN_ZOOM_LEVEL))
                .maxZoom(ConvertUtils.getDouble("maxZoom", options, DEFAULT_MAX_ZOOM_LEVEL))
                .pixelRatio(mReactContext.getResources().getDisplayMetrics().density)
                .glyphsRasterizationMode(GlyphsRasterizationMode.IDEOGRAPHS_RASTERIZED_LOCALLY)
                .build()
    }

    private fun convertPointPairToBounds(boundsFC: FeatureCollection): CoordinateBounds? {
        val geometryCollection = boundsFC.toGeometryCollection()
        val geometries = geometryCollection.geometries()
        if (geometries.size != 2) {
            return null
        }
        val pt0 = geometries.get(0) as Point?
        val pt1 = geometries.get(1) as Point?
        if (pt0 == null || pt1 == null) {
            return null
        }
        return CoordinateBounds(pt0, pt1)
    }

    private fun fromOfflineRegion(region: OfflineRegion): WritableMap? {
        val bb = region.tilePyramidDefinition?.bounds
        val map = Arguments.createMap()

        if (bb === null) return map

        val jsonBounds = writableArrayOf(
                writableArrayOf(bb.east(), bb.north()),
                writableArrayOf(bb.west(), bb.south())
        )

        map.putArray("bounds", jsonBounds)
        map.putString("metadata", String(region.metadata))

        return map
    }

    private fun getRegionByName(
            name: String?,
            offlineRegions: List<OfflineRegion>
    ): OfflineRegion? {
        if (name.isNullOrEmpty()) {
            return null
        }
        for (region in offlineRegions) {
            try {
                val byteMetadata = region.metadata

                if (byteMetadata != null) {
                    val metadata = JSONObject(String(byteMetadata))
                    if (name == metadata.getString("name")) {
                        return region
                    }
                }
            } catch (e: JSONException) {
                Log.w(LOG_TAG, e.localizedMessage)
            }
        }
        return null
    }

    @ReactMethod
    @Throws(JSONException::class)
    fun createPack(options: ReadableMap, promise: Promise) {
        try {
            val metadataStr = ConvertUtils.getString("metadata", options, "")
            val metadataBytes = getMetadataBytes(metadataStr)

            val metadata = JSONObject(metadataStr)
            val name = metadata.getString("name")

            val boundsStr = options.getString("bounds")!!
            val boundsFC = FeatureCollection.fromJson(boundsStr)
            val bounds = convertPointPairToBounds(boundsFC)

            if (metadataBytes == null || bounds == null) {
                promise.reject("createPack error:", "No metadata or bounds set")
                return
            }

            val definition: OfflineRegionTilePyramidDefinition = makeDefinition(bounds, options)

            UiThreadUtil.runOnUiThread {
                offlineRegionManager.createOfflineRegion(
                        definition,
                        createPackCallback(promise, metadataBytes, name)
                )
            }
        } catch (e: Throwable) {
            promise.reject("createPack error:", e)
        }
    }

    private fun createPackCallback(
            promise: Promise,
            metadata: ByteArray,
            name: String
    ): OfflineRegionCreateCallback {
        return OfflineRegionCreateCallback { expected ->
            if (expected.isValue) {
                expected.value?.let { region ->
                    region.setMetadata(metadata) { metadataResult ->
                        if (metadataResult.isError) {
                            promise.reject("createPack error:", "Failed to setMetadata")
                        } else {
                            Log.d(LOG_TAG, "createPack done:")
                            this.startLoading(region, name)
                            promise.resolve(fromOfflineRegion(region))
                        }
                    }
                }
            } else {
                Log.d(LOG_TAG, "createPack error:")
                promise.reject("createPack error:", "Failed to create OfflineRegion")
            }
        }
    }

    fun startLoading(region: OfflineRegion, name: String) {
        val timeoutHandler = TimeoutHandler(name, defaultTimeoutInterval) { timeoutName, timeout ->
            region.setOfflineRegionDownloadState(OfflineRegionDownloadState.INACTIVE)

            val timeoutError = OfflineRegionError(
                    OfflineRegionErrorType.OTHER,
                    "Offline region download timed out after ${timeout / 1000} seconds",
                    true,
                    null
            )

            offlinePackDidReceiveError(timeoutName, timeoutError)
        }

        val observer = OfflineRegionObserverImpl(
                name = name,
                onStatus = { status ->
                    timeoutHandler.reset()

                    val sentences = listOf(
                            "Downloaded ${status.completedResourceCount}/${status.requiredResourceCount} resources and ${status.completedResourceSize} bytes.",
                            "Required resource count is ${if (status.requiredResourceCountIsPrecise) "precise" else "a lower bound"}.",
                            "Download state is ${if (status.downloadState == OfflineRegionDownloadState.ACTIVE) "active" else "inactive"}."
                    )

                    Log.d(LOG_TAG, sentences.joinToString(" "))

                    when {
                        status.completedResourceCount == status.requiredResourceCount -> {
                            if (status.requiredResourceCountIsPrecise) {
                                Log.d(LOG_TAG, "Download complete with ${status.completedResourceCount} completed.")
                            } else {
                                Log.d(LOG_TAG, "Download complete but count was not precise.")
                            }
                            timeoutHandler.cancel()
                            region.setOfflineRegionDownloadState(OfflineRegionDownloadState.INACTIVE)
                            offlinePackProgressDidChange(name, status,  State.COMPLETE)
                        }
                        status.downloadState == OfflineRegionDownloadState.ACTIVE -> {
                            offlinePackProgressDidChange(name, status,  State.ACTIVE)
                        }
                        status.downloadState == OfflineRegionDownloadState.INACTIVE -> {
                            timeoutHandler.cancel()
                            if (status.completedResourceCount == status.requiredResourceCount) {
                                if (status.requiredResourceCountIsPrecise) {
                                    Log.d(LOG_TAG, "Download complete with ${status.completedResourceCount} completed.")
                                } else {
                                    Log.d(LOG_TAG, "Download complete but count was not precise.")
                                }
                                Log.d(LOG_TAG, "Download complete. Success.")
                                offlinePackProgressDidChange(name, status,  State.COMPLETE)
                            } else {
                                Log.d(LOG_TAG, "Download complete. Some resources failed to download. Resources that did download will be available offline.")
                                offlinePackProgressDidChange(name, status, State.INCOMPLETE)
                            }
                        }
                    }
                },
                onError = { name, error ->
                    if(error.isFatal){
                        timeoutHandler.cancel()
                    }else{
                        timeoutHandler.reset()
                    }
                    offlinePackDidReceiveError(name, error)
                },
                maxTilesExceeded = { name, limit ->
                   // Not implemented in Mapbox Version 11.
                   // This error is emitted via onError and with a type OfflineRegionErrorType.TILE_COUNT_LIMIT_EXCEEDED
                }
        )

        timeoutHandler.start()

        region.setOfflineRegionObserver(observer)
        region.setOfflineRegionDownloadState(OfflineRegionDownloadState.ACTIVE)
    }

    @ReactMethod
    fun getPacks(promise: Promise) {
        UiThreadUtil.runOnUiThread {
            offlineRegionManager.getOfflineRegions(object: OfflineRegionCallback {
                override fun run(expected: Expected<String, MutableList<OfflineRegion>>) {
                    if (expected.isValue) {
                        expected.value?.let {
                            val payload = Arguments.createArray()

                            for (region in it) {
                                payload.pushMap(fromOfflineRegion(region!!))
                            }

                            Log.d(LOG_TAG,  "getPacks done:" + it.size.toString())
                            promise.resolve(payload)
                        }
                    } else {
                        promise.reject("getPacks error:", expected.error)
                        Log.d(LOG_TAG,  "getPacks error:${expected.error}")
                    }
                }
            })
        }
    }

    @ReactMethod
    fun deletePack(name: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            offlineRegionManager.getOfflineRegions { regionsExpected ->
                if (regionsExpected.isValue) {
                    regionsExpected.value?.let { regions ->
                        var region = getRegionByName(name, regions);

                        if (region == null) {
                            promise.resolve(null);
                            Log.w(LOG_TAG, "deleteRegion - Unknown offline region");
                            return@getOfflineRegions
                        }

                        region.setOfflineRegionDownloadState(OfflineRegionDownloadState.INACTIVE)

                        region.purge { purgeExpected ->
                            if (purgeExpected.isError) {
                                promise.reject("deleteRegion error:", purgeExpected.error);
                            } else {
                                promise.resolve(null);
                            }
                        }
                    }
                } else {
                    promise.reject("deleteRegion error:", regionsExpected.error);
                }
            }
        }
    }

    @ReactMethod
    fun invalidatePack(name: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            offlineRegionManager.getOfflineRegions { expected ->
                if (expected.isValue) {
                    expected.value?.let { regions ->
                        var region = getRegionByName(name, regions);

                        if (region == null) {
                            promise.resolve(null);
                            Log.w(LOG_TAG, "invalidateRegion - Unknown offline region");
                            return@getOfflineRegions
                        }

                        region.invalidate { expected ->
                            if (expected.isError) {
                                promise.reject("invalidateRegion error:", expected.error);
                            } else {
                                promise.resolve(null);
                            }
                        }
                    }
                } else {
                    promise.reject("invalidateRegion error:", expected.error);
                }
            }
        }
    }

    @ReactMethod
    fun getPackStatus(name: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            offlineRegionManager.getOfflineRegions { expected ->
                if (expected.isValue) {
                    expected.value?.let { regions ->
                        var region = getRegionByName(name, regions);

                        if (region == null) {
                            promise.resolve(null);
                            Log.w(LOG_TAG, "getPackStatus - Unknown offline region");
                            return@getOfflineRegions
                        }

                        region.getStatus { statusExpected ->
                            if (statusExpected.isValue) {
                                statusExpected.value?.let { status ->
                                    val state = when {
                                        status.downloadState == OfflineRegionDownloadState.ACTIVE -> State.ACTIVE
                                        status.completedResourceCount == status.requiredResourceCount -> State.COMPLETE
                                        else -> State.INACTIVE
                                    }

                                    var metadata: JSONObject? = null
                                    try {
                                        val byteMetadata = region.metadata
                                        if (byteMetadata != null) {
                                            metadata = JSONObject(String(byteMetadata))
                                        }
                                    } catch (e: Exception) {
                                        Log.e(LOG_TAG, "Failed to get metadata: ${e.localizedMessage}")
                                    }

                                    promise.resolve(_makeRegionStatusPayload(name, status, state, metadata))
                                }
                            } else {
                                promise.reject("getPackStatus error", statusExpected.error)
                            }
                        }
                    }
                } else {
                    promise.reject("getPackStatus error:", expected.error);
                }
            }
        }
    }

    @ReactMethod
    fun pausePackDownload(name: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            offlineRegionManager.getOfflineRegions { expected ->
                if (expected.isValue) {
                    expected.value?.let { regions ->
                        var region = getRegionByName(name, regions);

                        if (region == null) {
                            promise.resolve(null);
                            Log.w(LOG_TAG, "pausePackDownload - Unknown offline region");
                            return@getOfflineRegions
                        }

                        region.setOfflineRegionDownloadState(OfflineRegionDownloadState.INACTIVE)
                        promise.resolve(null)
                    }
                } else {
                    promise.reject("pausePackDownload error:", expected.error);
                }
            }
        }
    }

    @ReactMethod
    fun resumePackDownload(name: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            offlineRegionManager.getOfflineRegions { expected ->
                if (expected.isValue) {
                    expected.value?.let { regions ->
                        var region = getRegionByName(name, regions);

                        if (region == null) {
                            promise.resolve(null);
                            Log.w(LOG_TAG, "resumeRegionDownload - Unknown offline region");
                            return@getOfflineRegions
                        }

                        this.startLoading(region, name)
                        promise.resolve(null);
                    }
                } else {
                    promise.reject("resumeRegionDownload error:", expected.error);
                }
            }
        }
    }

    private fun _makeRegionStatusPayload(name: String,
                                         status: OfflineRegionStatus,
                                         state: State,
                                         metadata: JSONObject? = null): WritableMap {
        val progressPercentage = if (status.requiredResourceCount > 0) {
            status.completedResourceCount.toDouble() / status.requiredResourceCount.toDouble()
        } else 0.0
        val percentage = min(ceil(progressPercentage * 100.0), 100.0)

        return Arguments.createMap().apply {
            putString("state", state.name.lowercase())
            putString("name", name)
            putDouble("percentage", percentage)
            putInt("completedResourceCount", status.completedResourceCount.toInt())
            putInt("completedResourceSize", status.completedResourceSize.toInt())
            putInt("completedTileSize", status.completedTileSize.toInt())
            putInt("completedTileCount", status.completedTileCount.toInt())
            putInt("requiredResourceCount", status.requiredResourceCount.toInt())
            putInt("requiredTileCount", status.requiredTileCount.toInt())

            metadata?.let {
                putMap("metadata", metadata.toReadableMap())
            }
        }
    }

    private fun offlinePackProgressDidChange(name: String, status: OfflineRegionStatus, state: State) {
        if (shouldSendProgressEvent(state)) {
            Log.d(LOG_TAG, "offlinePackProgressDidChange");
            val event = OfflineEvent(
                    OFFLINE_PROGRESS,
                    EventTypes.OFFLINE_STATUS,
                    _makeRegionStatusPayload(name, status, state, null)
            )
            sendEvent(event)
        }
    }

    private fun offlinePackDidReceiveError(name: String, error: OfflineRegionError) {
        val event = OfflineEvent(
                OFFLINE_ERROR,
                EventTypes.OFFLINE_ERROR,
                writableMapOf(
                        "name" to name,
                        "message" to error.message,
                        "type" to error.type.ordinal,
                        "fatal" to error.isFatal
                )
        )
        sendEvent(event)
    }

    @ReactMethod
    fun resetDatabase(promise: Promise) {
        UiThreadUtil.runOnUiThread {
            var purgedCount = 0
            offlineRegionManager.getOfflineRegions { expected ->
                if (expected.isValue) {
                    expected.value?.let { regions ->
                        if (regions.size == 0) promise.resolve(null)

                        for (region in regions) {
                            region.setOfflineRegionDownloadState(OfflineRegionDownloadState.INACTIVE)

                            region.purge { expected ->
                                if (expected.isError) {
                                    promise.reject("resetDatabase error:", expected.error);
                                } else {
                                    purgedCount++
                                    if (purgedCount == regions.size) {
                                        Log.d(LOG_TAG, "resetDatabase done: ${regions.size} packs were purged")
                                        promise.resolve(null)
                                    }
                                }
                            }
                        }
                    }
                } else {
                    promise.reject("resetDatabase error:", expected.error);
                }
            }
        }
    }

    @ReactMethod
    fun migrateOfflineCache(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Old and new cache file paths
            val targetDirectoryPathName = mReactContext.filesDir.absolutePath + "/.mapbox/map_data"
            val sourcePathName = mReactContext.filesDir.absolutePath + "/mbgl-offline.db"
            val sourcePath = Paths.get(sourcePathName)
            val targetPath = Paths.get("$targetDirectoryPathName/map_data.db")

            try {
                val source = File(sourcePath.toString())

                if (!source.exists()) {
                    Log.d(LOG_TAG, "Nothing to migrate")
                    promise.resolve(false)
                    return
                }

                val directory = File(targetDirectoryPathName)

                directory.mkdirs()
                Files.move(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING)
                Log.d(LOG_TAG, "v10 cache directory created successfully")
                promise.resolve(true)
            } catch (e: Exception) {
                val mes = "${e}... file move unsuccessful"
                Log.d(LOG_TAG, mes)
                promise.reject(mes)
            }
        } else {
            val mes = "\"migrateOfflineCache only supported on api level 26 or later\""
            Log.w(LOG_TAG, "migrateOfflineCache only supported on api level 26 or later")
            promise.reject(mes)
        }
    }

    @ReactMethod
    fun setTileCountLimit(tileCountLimit: Int) {
         UiThreadUtil.runOnUiThread {
            offlineRegionManager.setOfflineMapboxTileCountLimit(tileCountLimit.toLong())
        }
    }

    @ReactMethod
    fun setProgressEventThrottle(eventThrottle: Double) {
        progressEventThrottle.waitBetweenEvents = eventThrottle
    }

    @ReactMethod
    fun setTimeout(timeoutSeconds: Int) {
        Log.w(LOG_TAG, "setTimeout - ${timeoutSeconds}");
        // Convert minutes to milliseconds and update the default timeout interval
        defaultTimeoutInterval = TimeUnit.SECONDS.toMillis(timeoutSeconds.toLong())
    }

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

    private fun sendEvent(event: IEvent) {
        val eventEmitter = eventEmitter
        eventEmitter.emit(event.key, event.toJSON())
    }

    private val eventEmitter: RCTNativeAppEventEmitter
        private get() = mReactContext.getJSModule(RCTNativeAppEventEmitter::class.java)

    private fun shouldSendProgressEvent(state: State): Boolean {
        val currentTimestamp = System.currentTimeMillis().toDouble()

        val lastSentState = progressEventThrottle.lastSentState
        if (lastSentState == null || lastSentState != state) {
            progressEventThrottle.lastSentState = state
            progressEventThrottle.lastSentTimestamp = currentTimestamp
            return true
        }

        val waitBetweenEvents = progressEventThrottle.waitBetweenEvents ?: return true
        val lastSentTimestamp = progressEventThrottle.lastSentTimestamp ?: return true

        return if (currentTimestamp - lastSentTimestamp > waitBetweenEvents) {
            progressEventThrottle.lastSentTimestamp = currentTimestamp
            true
        } else {
            false
        }
    }

    private fun toJSONObjectSupportingLegacyMetadata(value: Value): JSONObject? {
        // see https://github.com/rnmapbox/maps/issues/2803
        try {
            return value.toJSONObject()
        } catch (err: org.json.JSONException) {
            try {
                return JSONObject(value.toString());
            } catch (_: org.json.JSONException) {
                throw err;
            }
        }
    }
    companion object {
        const val REACT_CLASS = "RNMBXOfflineModuleLegacy"
        const val LOG_TAG = "RNMBXOfflineModuleLegacy"
        const val DEFAULT_STYLE_URL = "mapbox://styles/mapbox/streets-v11"
        const val DEFAULT_MIN_ZOOM_LEVEL = 10.0
        const val DEFAULT_MAX_ZOOM_LEVEL = 20.0
        const val OFFLINE_ERROR = "MapboxOfflineRegionError"
        const val OFFLINE_PROGRESS = "MapboxOfflineRegionProgress"

    }

    // Data class to track region status
    data class OfflineRegionWithStatus(
            val region: OfflineRegion,
            var currentStatus: OfflineRegionStatus? = null
    )

    class OfflineRegionObserverImpl(
            private val name: String,
            private val onStatus: (OfflineRegionStatus) -> Unit,
            private val onError: (String, OfflineRegionError) -> Unit,
            private val maxTilesExceeded: (String, Long) -> Unit
    ) : OfflineRegionObserver {

        override fun statusChanged(status: OfflineRegionStatus) {
            onStatus(status)
        }

        override fun errorOccurred(error: OfflineRegionError) {
            if (!error.isFatal) {
                Log.d(LOG_TAG, "Offline resource download error: ${error.type}, ${error.message}")
            } else {
                Log.d(LOG_TAG, "Offline resource download fatal error: " +
                        "The region cannot proceed downloading of any resources and it will be put to inactive state. " +
                        "${error.type}, ${error.message}")
            }

            onError(name, error)
        }
        /*
        * Not implemented in mapbox version 11
        *
        override fun mapboxTileCountLimitExceeded(limit: Long) {
            Log.d(LOG_TAG, "Mapbox tile count max ($limit) has been exceeded!")
            maxTilesExceeded(name, limit)
        }
        */
    }
}
