package com.rnmapbox.rnmbx.modules

import android.R.array
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import com.mapbox.bindgen.Expected
import com.mapbox.bindgen.Value
import com.mapbox.common.*
import com.mapbox.geojson.*
import com.mapbox.maps.*
import com.rnmapbox.rnmbx.events.IEvent
import com.rnmapbox.rnmbx.events.OfflineEvent
import com.rnmapbox.rnmbx.events.constants.EventTypes
import com.rnmapbox.rnmbx.utils.*
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.utils.extensions.*
import com.rnmapbox.rnmbx.v11compat.offlinemanager.getOfflineManager
import com.mapbox.turf.TurfMeasurement
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.io.File
import java.io.UnsupportedEncodingException
import java.nio.file.Files
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.concurrent.CountDownLatch

import com.rnmapbox.rnmbx.v11compat.offlinemanager.*
import com.rnmapbox.rnmbx.v11compat.resourceoption.getMapboxAccessToken

data class ZoomRange(val minZoom: Byte, val maxZoom: Byte) {

}

const val RNMapboxInfoMetadataKey = "_rnmapbox"

enum class TileRegionPackState(val rawValue: String) {
    INVALID("invalid"),
    INACTIVE("inactive"),
    ACTIVE("active"),
    COMPLETE("complete"),
    UNKNOWN("unkown")
}
class TileRegionPack(var name: String, var state: TileRegionPackState = TileRegionPackState.UNKNOWN, var progress: TileRegionLoadProgress? = null, var metadata: JSONObject) {
    var cancelable: Cancelable? = null
    var loadOptions: TileRegionLoadOptions? = null

        // stored in metadata for resume functionality
    var styleURI: String? = null
    var bounds: Geometry? = null
    var zoomRange: ZoomRange? = null

    init {
        val rnMetadata = metadata.optJSONObject(RNMapboxInfoMetadataKey)
        if (rnMetadata != null) {
            val styleURI = rnMetadata.optString("styleURI")
            if (styleURI != null) {
                this.styleURI = styleURI
            }

            val bounds = rnMetadata.optJSONObject("bounds")
            if (bounds != null) {
                this.bounds = bounds.toGeometry()
            }

            val zoomRange = rnMetadata.optJSONArray("zoomRange")
            if (zoomRange != null) {
                this.zoomRange =
                    ZoomRange(zoomRange.getInt(0).toByte(), zoomRange.getInt(1).toByte())
            }
        }
    }

    public constructor(
        name: String,
        state: TileRegionPackState = TileRegionPackState.UNKNOWN,
        styleURI: String,
        bounds: Geometry,
        zoomRange: ZoomRange,
        metadata: JSONObject
    ) : this(name= name, state= state,progress= null, metadata= metadata) {
        val rnmeta = JSONObject()
        rnmeta.put("styleURI", styleURI)
        this.styleURI = styleURI
        rnmeta.put("bounds", bounds.toJSONObject())
        this.bounds = bounds
        rnmeta.put("zoomRange", JSONArray(arrayOf(zoomRange.minZoom, zoomRange.maxZoom)))
        this.zoomRange = zoomRange
        this.metadata.put(RNMapboxInfoMetadataKey, rnmeta);
    }
}

@ReactModule(name = RNMBXOfflineModule.REACT_CLASS)
class RNMBXOfflineModule(private val mReactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(
        mReactContext
    ) {
    var tileRegionPacks = HashMap<String, TileRegionPack>()
    private var mProgressEventThrottle = 300.0


    val tileStore: TileStore by lazy {
        val result = TileStore.create()
        result.setAccessToken(RNMBXModule.getAccessToken(mReactContext));
        result
    }

    val offlineManager: OfflineManager by lazy {
        getOfflineManager(tileStore) {
            RNMBXModule.getAccessToken(mReactContext)
        }
    }

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

    // region React methods
    @ReactMethod
    @Throws(JSONException::class)
    fun createPack(options: ReadableMap, promise: Promise) {
        try {
            val metadataStr = options.getString("metadata")!!
            val metadata = JSONObject(metadataStr)
            val metadataValue = Value.valueOf(metadataStr)
            val id = metadata.getString("name")!!

            val boundsStr = options.getString("bounds")!!
            val boundsFC = FeatureCollection.fromJson(boundsStr)
            val bounds = convertPointPairToBounds(boundsFC)

            val actPack = TileRegionPack(
                name = id,
                styleURI = options.getString("styleURL")!!,
                bounds = bounds,
                zoomRange = ZoomRange(
                    minZoom = options.getInt("minZoom").toByte(),
                    maxZoom = options.getInt("maxZoom").toByte()
                ),
                metadata = metadata
            )
            tileRegionPacks[id] = actPack
            startLoading(pack = actPack).map {
                writableMapOf("bounds" to boundsStr, "metadata" to metadataStr)
            }.toPromise(promise, "createPack")
        } catch (e: Throwable) {
            promise.reject("createPack", e)
        }
    }

    @ReactMethod
    fun getPackStatus(name: String, promise: Promise) {
        val pack = tileRegionPacks[name]
        if (pack == null) {
            promise.reject(Error("Pack: $name not found"))
            return
        }
        tileStore.getTileRegion(name) { expected ->
            expected.value?.also {
                val region = it
                tileStore.getTileRegionMetadata(name) { expected ->
                    expected.value?.also {
                        val pack = TileRegionPack(
                            name= name,
                            progress= toProgress(region),
                            metadata= toJSONObjectSupportingLegacyMetadata(it) ?: JSONObject()
                        )
                        tileRegionPacks[name] = pack
                        promise.resolve(_makeRegionStatusPayload(pack))
                    } ?: run {
                        promise.reject(LOG_TAG, expected.error!!.message)
                    }
                }
            } ?: run {
                promise.reject(LOG_TAG, expected.error!!.message)
            }
        }
    }

    @ReactMethod
    fun resumePackDownload(name: String, promise: Promise) {
        val pack = tileRegionPacks[name]
        if (pack != null) {
            startLoading(pack).map { null }.toPromise(promise,"resumePackDownload")
        } else {
            promise.reject("resumePackDownload", "Unknown offline pack: $name")
        }
    }

    @ReactMethod
    fun pausePackDownload(name: String, promise: Promise) {
        val pack = tileRegionPacks[name]
        if (pack != null) {
            if (pack.cancelable != null) {
                pack.cancelable?.cancel()
                pack.cancelable = null
                promise.resolve(null)
            } else {
                promise.reject("resumeRegionDownload", "Offline pack: $name already cancelled")
            }
        } else {
            promise.reject("resumeRegionDownload", "Unknown offline region")
        }
    }

    @ReactMethod
    fun setTileCountLimit(tileCountLimit: Int) {
        val offlineRegionManager = getOfflineRegionManager {
            RNMBXModule.getAccessToken(mReactContext)
        }
        offlineRegionManager.setOfflineMapboxTileCountLimit(tileCountLimit.toLong())
    }

    @ReactMethod
    fun deletePack(name: String, promise: Promise) {
        val pack = tileRegionPacks[name]

        if (pack == null) {
            promise.resolve(null)
            return
        }

        if (pack.state == TileRegionPackState.INVALID) {
            promise.reject("deletePack", "Pack: $name has already been deleted")
            return
        }

        tileStore.removeTileRegion(name, object: TileRegionCallback {
            override fun run(expected: Expected<TileRegionError, TileRegion>) {
                expected.value.also {
                    tileRegionPacks[name]!!.state = TileRegionPackState.INVALID
                    promise.resolve(null);
                } ?: run {
                    promise.reject("deletePack", expected.error?.message ?: "n/a")
                }
            }
        })
    }

    @ReactMethod
    fun getPacks(promise: Promise) {
        tileStore.getAllTileRegions(object : TileRegionsCallback {
            override fun run(expected: Expected<TileRegionError, List<TileRegion>>) {
                UiThreadUtil.runOnUiThread(object : Runnable {
                    override fun run() {
                        expected.value?.also { regions ->
                            convertRegionsToJSON(regions, promise)
                        } ?: run {
                            promise.reject("getPacks", expected.error!!.message)
                        }
                    }
                })
            }
        })
    }
    // endregion

    fun startLoading(pack: TileRegionPack): Result<Unit> {
        try {
            val id = pack.name
            val bounds = pack.bounds
                ?: return Result.failure(IllegalArgumentException("startLoading failed as there are no bounds in pack"))
            val zoomRange = pack.zoomRange
                ?: return Result.failure(IllegalArgumentException("startLoading failed as there is no zoomRange in pack"))
            val styleURI = pack.styleURI
                ?: return Result.failure(IllegalArgumentException("startLoading failed as there is no styleURI in pack"))
            val metadata = pack.metadata
                ?: return Result.failure(IllegalArgumentException("startLoading failed as there is no metadata in pack"))

            val stylePackOptions = StylePackLoadOptions.Builder()
                .glyphsRasterizationMode(GlyphsRasterizationMode.IDEOGRAPHS_RASTERIZED_LOCALLY)
                .metadata(metadata.toMapboxValue())
                .build()

            val descriptorOptions = TilesetDescriptorOptions.Builder()
                .styleURI(styleURI)
                .minZoom(zoomRange.minZoom)
                .maxZoom(zoomRange.maxZoom)
                .stylePackOptions(stylePackOptions)
                .pixelRatio(2.0f)
                .build()
            val tilesetDescriptor = offlineManager.createTilesetDescriptor(descriptorOptions)

            val loadOptions = TileRegionLoadOptions.Builder()
                .geometry(bounds)
                .descriptors(arrayListOf(tilesetDescriptor))
                .metadata(metadata.toMapboxValue())
                .acceptExpired(true)
                .networkRestriction(NetworkRestriction.NONE)
                .averageBytesPerSecond(null)
                .build()

            var lastProgress: TileRegionLoadProgress? = null
            val task = this.tileStore.loadTileRegion(
                id, loadOptions,
                { progress ->
                    lastProgress = progress
                    tileRegionPacks[id]!!.progress = progress
                    tileRegionPacks[id]!!.state = TileRegionPackState.ACTIVE

                    offlinePackProgressDidChange(progress, metadata, TileRegionPackState.ACTIVE)
                },
                { expected ->
                    expected.value?.also {
                        val progress = lastProgress
                        if (progress != null) {
                            offlinePackProgressDidChange(
                                progress,
                                metadata,
                                TileRegionPackState.COMPLETE
                            )
                        } else {
                            Logger.w(
                                LOG_TAG,
                                "startLoading: tile region completed, but got no progress information"
                            )
                        }
                        tileRegionPacks[id]!!.state = TileRegionPackState.COMPLETE
                    } ?: run {
                        val error = expected.error ?: TileRegionError(
                            TileRegionErrorType.OTHER,
                            "$LOG_TAG neither value nor error in expected"
                        )

                        tileRegionPacks[id]!!.state = TileRegionPackState.INACTIVE
                        offlinePackDidReceiveError(name = id, error = error)
                    }
                },
            )
            tileRegionPacks[id]!!.cancelable = task
            return Result.success(Unit)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }

    private fun convertRegionsToJSON(tileRegions: List<TileRegion>, promise: Promise) {
        val countDownLatch = CountDownLatch(tileRegions.size * 2)
        val foo = mutableMapOf<String,Pair<Expected<TileRegionError,Geometry>, TileRegion>>()
        val geometryResults = mutableMapOf<String, Pair<Expected<TileRegionError, Geometry>,TileRegion>>();
        val metadataResults = mutableMapOf<String, Expected<TileRegionError, Value>>()
        val errors = ArrayList<TileRegionError?>()
        try {
            for (region: TileRegion in tileRegions) {
                tileStore.getTileRegionGeometry(region.id
                    ) { result ->
                        geometryResults[region.id] = Pair(result, region)
                        countDownLatch.countDown()
                    }
                tileStore.getTileRegionMetadata(region.id) { result ->
                    metadataResults[region.id] = result
                    countDownLatch.countDown()
                }
            }
        } catch (error: Error) {
            Logger.e(LOG_TAG, "convertRegionsToJSON. failed to iterate regions")
        }

        try {
            countDownLatch.await()

            val firstError = geometryResults.firstNotNullOfOrNull { (id,pair) -> pair.first.error }
            if (firstError != null) {
                promise.reject("convertRegionsToJSON", firstError.message)
                return
            }

            val results = geometryResults.map { (id, pair) ->
                val (expected, region) = pair
                val geometry = expected.value!!
                return@map Pair(id, Triple(geometry, region, metadataResults[id]?.value))
            }

            promise.resolve(
                writableArrayOf(
                *results.map { (id,geometry_region_metadata) ->
                    val (geometry, region, metadata) = geometry_region_metadata
                    val metadataJSON = if (metadata != null) { toJSONObjectSupportingLegacyMetadata(metadata) } else { null }
                    val ret = convertRegionToJSON(region, geometry, metadataJSON)
                    val pack = tileRegionPacks[region.id] ?: TileRegionPack(
                        name= region.id,
                        state= TileRegionPackState.UNKNOWN,
                        progress= toProgress(region),
                        metadata= metadataJSON ?: JSONObject()
                    )

                    if (region.hasCompleted()) {
                        pack.state = TileRegionPackState.COMPLETE
                    }
                    tileRegionPacks[region.id] = pack
                    return@map ret
                }.toTypedArray())
            )
        } catch (interruptedException: InterruptedException) {
            promise.reject(interruptedException)
        }
    }

    private fun convertRegionToJSON(region: TileRegion, geometry: Geometry, metadata: JSONObject?): ReadableMap {
        val bb = geometry.calculateBoundingBox()

        val jsonBounds = writableArrayOf(
            bb.northeast().longitude(),
            bb.northeast().latitude(),
            bb.southwest().longitude(),
            bb.southwest().latitude()
        )
        val completed = (region.completedResourceCount == region.requiredResourceCount)

        val metadataOrEmpty = metadata ?: JSONObject()
        val metadataWithName = metadataOrEmpty.put("name", region.id)

        var result = writableMapOf(
            "requiredResourceCount" to region.requiredResourceCount,
            "completedResourceCount" to region.completedResourceCount,
            "completedResourceSize" to region.completedResourceSize,
            "state" to (if (completed) TileRegionPackState.COMPLETE.rawValue else TileRegionPackState.UNKNOWN.rawValue ),
            "metadata" to metadataWithName.toString(),
            "bounds" to jsonBounds,
        );

        if (region.requiredResourceCount > 0) {
            result.putDouble("percentage", region.toPercentage())
        } else {
            result.putNull("percentage")
        }

        val expires = region.expires
        if (expires != null) {
            result.putString("expires", expires.toString())
        }

        return result
    }

    private fun toProgress(region: TileRegion): TileRegionLoadProgress {
        return TileRegionLoadProgress(
            region.completedResourceCount,
            region.completedResourceSize,
            0,
            region.requiredResourceCount,
            0,
           0
        )
    }

    private fun _makeRegionStatusPayload(pack: TileRegionPack): WritableMap {
        return _makeRegionStatusPayload(pack.name, pack.progress, pack.state, pack.metadata)
    }

    private fun _makeRegionStatusPayload(name:String, progress: TileRegionLoadProgress?,state: TileRegionPackState, metadata: JSONObject?): WritableMap {
        var result = Arguments.createMap()
        if (progress != null) {
            result = writableMapOf(
                "state" to (if (progress.hasCompleted()) TileRegionPackState.COMPLETE.rawValue else state.rawValue),
                "name" to name,
                "percentage" to progress.toPercentage(),
                "completedResourceCount" to progress.completedResourceCount,
                "completedResourceSize" to progress.completedResourceSize,
                "erroredResourceCount" to progress.erroredResourceCount,
                "loadedResourceSize" to progress.loadedResourceSize,
                "loadedResourceCount" to progress.loadedResourceCount,
                "requiredResourceCount" to progress.requiredResourceCount
            )
        } else {
            result = writableMapOf(
                "state" to state.rawValue,
                "name" to name,
                "percentage" to null,
            )
        }
        if (metadata != null) {
            result.putMap("metadata", metadata.toReadableMap())
        }
        return result
    }

    private fun offlinePackProgressDidChange(progress: TileRegionLoadProgress, metadata: JSONObject, state: TileRegionPackState) {
        // TODO throttle
        sendEvent(this.makeProgressEvent(metadata.getString("name"), progress, state))
    }

    private fun offlinePackDidReceiveError(name: String, error: TileRegionError) {
        val event = OfflineEvent(
            OFFLINE_ERROR,
            EventTypes.OFFLINE_ERROR,
            writableMapOf(
                "name" to name,
                "message" to error.message
            )
        )
        sendEvent(event)
    }

    private fun convertPointPairToBounds(boundsFC: FeatureCollection): Geometry {
        val geometryCollection = boundsFC.toGeometryCollection()
        val geometries = geometryCollection.geometries()
        if (geometries.size != 2) {
            return geometryCollection
        }
        val g0 = geometries.get(0) as Point?
        val g1 = geometries.get(1) as Point?
        if (g0 == null || g1 == null) {
            return geometryCollection
        }
        val pt0 = g0
        val pt1 = g1
        return Polygon.fromLngLats(
            listOf(
            listOf(
                pt0,
                Point.fromLngLat(pt1.longitude(), pt0.latitude()),
                pt1,
                Point.fromLngLat(pt0.longitude(), pt1.latitude()),
                pt0
            ))
        )
    }

    @ReactMethod
    fun resetDatabase(promise: Promise) {
        tileStore.getAllTileRegions { expected ->
            expected.value?.also { tileRegions ->
                tileRegions.forEach { tileRegion ->
                    tileStore.removeTileRegion(tileRegion.id);
                }

                offlineManager.getAllStylePacks { expected ->
                    expected.value?.also { stylePacks ->
                        stylePacks.forEach { stylePack ->
                            offlineManager.removeStylePack(stylePack.styleURI)
                        }
                        promise.resolve(null)
                    } ?: run {
                        Logger.w(LOG_TAG, "resetDatabase: error: ${expected.error}")
                        promise.reject(Error(expected.error?.message ?: "n/a"))
                    }
                }

                promise.resolve(null);
            }?: run {
                Logger.w(LOG_TAG, "resetDatabase: error: ${expected.error}")
                promise.reject(Error(expected.error?.message ?: "n/a"))
            }
        }

    }

    @ReactMethod
    fun migrateOfflineCache() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Old and new cache file paths
            val targetPathName = mReactContext.filesDir.absolutePath + "/.mapbox/map_data"
            val sourcePath = Paths.get(mReactContext.filesDir.absolutePath + "/mbgl-offline.db")
            val targetPath = Paths.get(targetPathName + "/map_data.db")

            try {
                val directory = File(targetPathName)
                directory.mkdirs()
                Files.move(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING)
                Log.d(LOG_TAG, "v10 cache directory created successfully")
            } catch (e: Exception) {
                Log.d(LOG_TAG, "${e}... file move unsuccessful")
            }
        } else {
            Logger.w(LOG_TAG, "migrateOfflineCache only supported on api level 26 or later")
        }
    }

    @ReactMethod
    fun setProgressEventThrottle(eventThrottle: Double) {
        mProgressEventThrottle = eventThrottle
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

    private fun makeProgressEvent(name: String, progress: TileRegionLoadProgress, state: TileRegionPackState): OfflineEvent {
        return OfflineEvent(
            OFFLINE_PROGRESS,
            EventTypes.OFFLINE_STATUS,
            _makeRegionStatusPayload(name, progress, state, null)
        )
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
        const val REACT_CLASS = "RNMBXOfflineModule"
        const val LOG_TAG = REACT_CLASS
        const val OFFLINE_ERROR = "MapboxOfflineRegionError"
        const val OFFLINE_PROGRESS = "MapboxOfflineRegionProgress"

    }
}

private fun <T> Result<T>.toPromise(promise: Promise, error: String) {
    val ok = getOrElse {
        promise.reject(error, exceptionOrNull() ?: Exception("Unknown error"))
        return@toPromise
    }
    promise.resolve(ok)
}

fun TileRegionLoadProgress.toPercentage(): Double {
    return (completedResourceCount.toDouble() * 100.0) / (requiredResourceCount.toDouble())
}

fun TileRegionLoadProgress.hasCompleted(): Boolean {
    return (completedResourceCount == requiredResourceCount)
}

fun TileRegion.toPercentage(): Double {
    return (completedResourceCount.toDouble() * 100.0) / (requiredResourceCount.toDouble())
}

fun TileRegion.hasCompleted(): Boolean {
    return (completedResourceCount == requiredResourceCount)
}




