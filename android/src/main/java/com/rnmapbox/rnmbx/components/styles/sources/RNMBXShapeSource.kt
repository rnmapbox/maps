package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import android.os.Handler
import android.os.HandlerThread
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.mapbox.bindgen.Value
import com.mapbox.common.Cancelable
import com.mapbox.geojson.Feature
import com.mapbox.geojson.FeatureCollection
import com.mapbox.geojson.GeoJson
import com.mapbox.geojson.Geometry
import com.mapbox.maps.*
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.sources.generated.GeoJsonSource
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.events.AndroidCallbackEvent
import com.rnmapbox.rnmbx.events.FeatureClickEvent
import com.rnmapbox.rnmbx.shapeAnimators.ShapeAnimationConsumer
import com.rnmapbox.rnmbx.shapeAnimators.ShapeAnimator
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.v11compat.feature.*
import org.json.JSONException
import org.json.JSONObject
import java.net.URL

private const val LOG_TAG = "RNMBXShapeSource"
private const val SHAPE_REPLACED_ERROR = "ShapeSource: a new shape replaced this partial update"

// Passing a large shape to the SDK takes ~100ms, so it can't run on the main thread. Unlike
// GeoJsonSource.data(), work posted here keeps its order with later changes to the source.
private val sourceDataHandler by lazy {
    Handler(HandlerThread("RNMBXShapeSourceData").apply { start() }.looper)
}

class RNMBXShapeSource(context: Context, private val mManager: RNMBXShapeSourceManager) :
    RNMBXSource<GeoJsonSource>(context), ShapeAnimationConsumer {
    private var mURL: URL? = null
    private var mShape: String? = null
    private var mShapeAnimator: ShapeAnimator? = null
    private var mCluster: Boolean? = null
    private var mClusterRadius: Long? = null
    private var mClusterMaxZoom: Long? = null
    private var mClusterMinPoints: Long? = null
    private var mClusterProperties: HashMap<String, Any>? = null
    private var mMaxZoom: Long? = null
    private var mMinZoom: Long? = null
    private var mBuffer: Long? = null
    private var mTolerance: Double? = null
    private var mLineMetrics: Boolean? = null

    private var mShapeRevision = 0
    private var mNextShapeRevision = 0
    private var mSourceAdded = false
    private val mPartialChanges = PartialFeatureChanges()
    private val mPendingChanges = PendingPartialChanges()
    private var mPartialChangeSubscriptions = listOf<Cancelable>()

    override fun hasNoDataSoRefersToExisting(): Boolean {
        return (mURL == null) && (mShape == null)
    }

    override fun addToMap(mapView: RNMBXMapView) {

        // Wait for style before adding the source to the map
        mapView.getMapboxMap().getStyle {
            val map = mapView.getMapboxMap()
            super@RNMBXShapeSource.addToMap(mapView)
        }
    }

    override fun addToMap(existings: Boolean, style: Style, mapView: RNMBXMapView) {
        val created = !style.styleSourceExists(iD!!)
        super.addToMap(existings, style, mapView)
        if (created) {
            (mShape ?: mURL?.toString())?.let { applySourceData(style, it) }
        }
        replayPartialChanges(style)
        mSourceAdded = true
        sendPartialChanges()
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        mSourceAdded = false
        if (reason == RemovalReason.STYLE_CHANGE) {
            mPendingChanges.markNoneInFlight()
        } else {
            mPendingChanges.clear().forEach { it.promise.reject("error", "ShapeSource was removed from the map") }
        }
        mPartialChangeSubscriptions.forEach { it.cancel() }
        mPartialChangeSubscriptions = listOf()

        if (reason == RemovalReason.VIEW_REMOVAL) {
            mShapeAnimator?.unsubscribe(this)
        }
        return super.removeFromMap(mapView, reason)
    }

    override fun setId(id: Int) {
        super.setId(id)
        mManager.tagAssigned(id)
    }

    override fun makeSource(): GeoJsonSource {
        val builder = GeoJsonSource.Builder(iD.toString())
        getOptions(builder)
        return builder.build()
    }

    private fun applySourceData(style: Style, data: String) {
        val sourceId = iD!!
        sourceDataHandler.post {
            style.setStyleGeoJSONSourceData(sourceId, "", GeoJSONSourceData.valueOf(data)).error?.let {
                Logger.w(LOG_TAG, "Setting the data of source $sourceId failed: $it")
            }
        }
    }

    fun setURL(url: URL) {
        mURL = url
        mPartialChanges.clear()
        if (mSource != null && mMapView != null && !mMapView!!.isDestroyed) {
            mMap?.getStyle()?.let { applySourceData(it, url.toString()) }
        }
    }

    fun setShape(geoJSONStr: String) {
        mShapeAnimator?.unsubscribe(this)
        mShapeAnimator = null
        mPartialChanges.clear()

        val shapeAnimatorManager = mManager.shapeAnimatorManager
        if (shapeAnimatorManager.isShapeAnimatorTag(geoJSONStr)) {
            shapeAnimatorManager.get(geoJSONStr)?.let { shapeAnimator ->
                mShapeAnimator = shapeAnimator
                shapeAnimator.subscribe(this)

                val shape = shapeAnimator.getShape()
                shapeUpdated(shape)
            }
        } else {
            mShape = geoJSONStr
            if (mSource != null && mMapView != null && !mMapView!!.isDestroyed) {
                mMap?.getStyle()?.let { applySourceData(it, geoJSONStr) }
            }
        }
    }

    fun setShapeRevision(revision: Int) {
        mNextShapeRevision = revision
    }

    /** Runs after all props of a transaction, so `shape` is set whatever order the props came in. */
    fun applyShapeRevision() {
        if (mNextShapeRevision == mShapeRevision) return
        mShapeRevision = mNextShapeRevision
        mPendingChanges.replacedBy(mShapeRevision).forEach { it.promise.reject("error", SHAPE_REPLACED_ERROR) }
        sendPartialChanges()
    }

    private fun toGeoJSONSourceData(geoJson: GeoJson): GeoJSONSourceData? {
        return when (geoJson) {
            is Geometry ->
                GeoJSONSourceData(geoJson)
            is Feature ->
                GeoJSONSourceData(geoJson)
            is FeatureCollection ->
                GeoJSONSourceData(geoJson.features() ?: listOf())
            else -> {
                Logger.e(
                    LOG_TAG,
                    "Cannot convert shape to Geometry, Feature, or FeatureCollection: $geoJson"
                )
                return null
            }
        }
    }
    override fun shapeUpdated(geoJson: GeoJson) {
        mSource?.also {
            if (mSource != null && mMapView != null && !mMapView!!.isDestroyed) {
                toGeoJSONSourceData(geoJson)?.let {
                    mMap?.getStyle()?.setStyleGeoJSONSourceData(iD!!,
                        "animated-shape",
                        it)
                }
            }
        } ?: run {
            mShape = geoJson.toJson()
        }
    }

    fun setCluster(cluster: Boolean) {
        mCluster = cluster
    }

    fun setClusterRadius(clusterRadius: Long) {
        mClusterRadius = clusterRadius
    }

    fun setClusterMaxZoom(clusterMaxZoom: Long) {
        mClusterMaxZoom = clusterMaxZoom
        if (mSource != null && mMapView != null && !mMapView!!.isDestroyed) {
            val result = mMap!!.getStyle()!!
                .setStyleSourceProperty(iD!!, "clusterMaxZoom", Value.valueOf(clusterMaxZoom))
        }
    }

    fun setClusterMinPoints(clusterMinPoints: Long) {
        mClusterMinPoints = clusterMinPoints
    }

    fun setClusterProperties(clusterProperties: HashMap<String, Any>) {
        mClusterProperties = clusterProperties
    }

    fun setMaxZoom(maxZoom: Long) {
        mMaxZoom = maxZoom
    }

    fun setMinZoom(minZoom: Long) {
        mMinZoom = minZoom
    }

    fun setBuffer(buffer: Long) {
        mBuffer = buffer
    }

    fun setTolerance(tolerance: Double) {
        mTolerance = tolerance
    }

    fun setLineMetrics(lineMetrics: Boolean) {
        mLineMetrics = lineMetrics
    }

    override fun onPress(event: OnPressEvent?) {
        mManager.handleEvent(FeatureClickEvent.makeShapeSourceEvent(this, event))
    }

    private fun getOptions(builder: GeoJsonSource.Builder) {
        promoteId?.let { builder.promoteId(it) }
        if (mCluster != null) {
            builder.cluster(mCluster!!)
        }
        if (mClusterRadius != null) {
            builder.clusterRadius(mClusterRadius!!)
        }
        if (mClusterMaxZoom != null) {
            builder.clusterMaxZoom(mClusterMaxZoom!!)
        }
        if (mClusterMinPoints != null) {
            builder.clusterMinPoints(mClusterMinPoints!!)
        }
        if (mClusterProperties != null) {
            builder.clusterProperties(mClusterProperties!!)
        }
        if (mMaxZoom != null) {
            builder.maxzoom(mMaxZoom!!)
        }
        if (mMinZoom != null) {
            builder.minzoom(mMinZoom!!)
        }
        if (mBuffer != null) {
            builder.buffer(mBuffer!!)
        }
        if (mTolerance != null) {
            builder.tolerance(mTolerance!!)
        }
        if (mLineMetrics != null) {
            builder.lineMetrics(mLineMetrics!!)
        }
    }

    fun querySourceFeatures(
        callbackID: String,
        filter: Expression?
    ) {
        if (mSource == null) {
            val payload: WritableMap = WritableNativeMap()
            payload.putString("error", "source is not yet loaded")
            val event = AndroidCallbackEvent(this, callbackID, payload)
            mManager.handleEvent(event)
            return
        }
        val _this = this
        mMap!!.querySourceFeatures(
            iD!!, SourceQueryOptions(
                null,  // v10todo
                filter!!
            )
        ) { features ->
            if (features.isError) {
                Logger.e(LOG_TAG, String.format("Error: %s", features.error))
            } else {
                val payload: WritableMap = WritableNativeMap()
                val result: MutableList<Feature> = ArrayList(
                    features.value!!.size
                )
                for (i in features.value!!) {
                    result.add(i.feature)
                }
                payload.putString("data", FeatureCollection.fromFeatures(result).toJson())
                val event = AndroidCallbackEvent(_this, callbackID, payload)
                mManager.handleEvent(event)
            }
        }
    }

    fun addFeatures(features: List<Feature>, featureIds: List<String>, shapeRevision: Int, promise: Promise) {
        enqueuePartialChange(PartialChangeType.ADD, featureIds, features, shapeRevision, promise)
    }

    fun updateFeatures(features: List<Feature>, featureIds: List<String>, shapeRevision: Int, promise: Promise) {
        enqueuePartialChange(PartialChangeType.UPDATE, featureIds, features, shapeRevision, promise)
    }

    fun removeFeatures(featureIds: List<String>, shapeRevision: Int, promise: Promise) {
        enqueuePartialChange(PartialChangeType.REMOVE, featureIds, listOf(), shapeRevision, promise)
    }

    private fun enqueuePartialChange(
        type: PartialChangeType,
        featureIds: List<String>,
        features: List<Feature>,
        shapeRevision: Int,
        promise: Promise
    ) {
        if (shapeRevision < mShapeRevision) {
            promise.reject("error", SHAPE_REPLACED_ERROR)
            return
        }
        mPendingChanges.add(type, featureIds, features, shapeRevision, promise)
        sendPartialChanges()
    }

    private fun sendPartialChanges() {
        val style = mMap?.getStyle()
        val sourceId = iD
        if (!mSourceAdded || style == null || sourceId == null) return
        subscribeToPartialChangeResults()
        val changes = mPendingChanges.next(mShapeRevision)
        if (changes.isEmpty()) return
        val dataId = changes.last().dataId
        val type = changes.first().type
        val features = changes.flatMap { it.features }
        val featureIds = changes.flatMap { it.featureIds }
        sourceDataHandler.post {
            val result = when (type) {
                PartialChangeType.ADD -> style.addGeoJSONSourceFeatures(sourceId, dataId, features)
                PartialChangeType.UPDATE -> style.updateGeoJSONSourceFeatures(sourceId, dataId, features)
                PartialChangeType.REMOVE -> style.removeGeoJSONSourceFeatures(sourceId, dataId, featureIds)
            }
            result.error?.let { error ->
                UiThreadUtil.runOnUiThread {
                    if (mSourceAdded) onPartialChangeRefused(dataId, error)
                }
            }
        }
    }

    private fun replayPartialChanges(style: Style) {
        val sourceId = iD!!
        val added = mPartialChanges.added
        val updated = mPartialChanges.updated
        val removed = mPartialChanges.removed
        sourceDataHandler.post {
            if (added.isNotEmpty()) style.addGeoJSONSourceFeatures(sourceId, "", added)
            if (updated.isNotEmpty()) style.updateGeoJSONSourceFeatures(sourceId, "", updated)
            if (removed.isNotEmpty()) style.removeGeoJSONSourceFeatures(sourceId, "", removed)
        }
    }

    private fun subscribeToPartialChangeResults() {
        val map = mMap
        if (mPartialChangeSubscriptions.isNotEmpty() || mPendingChanges.isEmpty || map == null) return
        mPartialChangeSubscriptions = listOf(
            map.subscribeSourceDataLoaded { event ->
                val dataId = event.dataId
                if (event.sourceId == iD && event.type == SourceDataLoadedType.METADATA && !dataId.isNullOrEmpty()) {
                    if (mPendingChanges.isInFlight(dataId)) {
                        mPendingChanges.confirm().forEach {
                            mPartialChanges.record(it)
                            it.promise.resolve(null)
                        }
                        onPartialChangeSettled()
                    }
                }
            },
            map.subscribeMapLoadingError { error ->
                if (error.sourceId == iD && error.type == MapLoadingErrorType.SOURCE) {
                    onSourceError(error.message)
                }
            }
        )
    }

    private fun onSourceError(message: String) {
        val json = try {
            JSONObject(message)
        } catch (e: JSONException) {
            return
        }
        val dataId = json.optString("dataId", null) ?: return
        onPartialChangeRefused(dataId, json.optString("message", message))
    }

    private fun onPartialChangeRefused(dataId: String, message: String) {
        val featureId = message.substringAfter("feature id: ", "").ifEmpty { null }
        if (!mPendingChanges.isRefusalOfInFlight(dataId, featureId)) return
        val refusal = mPendingChanges.refuse(featureId)
        refusal.applied.forEach {
            mPartialChanges.record(it)
            it.promise.resolve(null)
        }
        refusal.appliedPart?.let { mPartialChanges.record(it) }
        refusal.refused.promise.reject("error", message)
        renderAppliedFeatures(refusal.applied.flatMap { it.features } + (refusal.appliedPart?.features ?: listOf()))
        onPartialChangeSettled()
    }

    // The SDK renders what a refused call kept only with the next change, so update them to themselves
    private fun renderAppliedFeatures(features: List<Feature>) {
        val style = mMap?.getStyle()
        val sourceId = iD
        if (features.isEmpty() || style == null || sourceId == null) return
        sourceDataHandler.post { style.updateGeoJSONSourceFeatures(sourceId, "", features) }
    }

    private fun onPartialChangeSettled() {
        if (mPendingChanges.isEmpty) {
            mPartialChangeSubscriptions.forEach { it.cancel() }
            mPartialChangeSubscriptions = listOf()
        } else {
            sendPartialChanges()
        }
    }

    private fun callbackSuccess(payload: WritableMap, promise: Promise) {
        promise.resolve(payload)
    }
    private fun callbackError(error: String, where: String, promise: Promise) {
        promise.reject("error", "$where: $error")
    }

    fun getClusterExpansionZoom(featureJSON: String, promise: Promise) {
        val feature = Feature.fromJson(featureJSON)

        mMap!!.getGeoJsonClusterExpansionZoom(iD!!, feature, QueryFeatureExtensionCallback { features ->
            if (features.isValue) {
                val contents = features.value!!.value!!.contents
                val payload: WritableMap = WritableNativeMap()

                if (contents is Long) {
                    val payload: WritableMap = WritableNativeMap()
                    payload.putInt("data", contents.toInt())
                    callbackSuccess(payload, promise)
                    return@QueryFeatureExtensionCallback
                } else {
                    callbackError(

                        "Not a number: $contents",
                        "getClusterExpansionZoom/getGeoJsonClusterExpansionZoom",
                        promise
                    )
                    return@QueryFeatureExtensionCallback
                }
            } else {
                callbackError(
                    features.error ?: "Unknown error",
                    "getClusterExpansionZoom/getGeoJsonClusterExpansionZoom",
                    promise
                )
                return@QueryFeatureExtensionCallback
            }
        })
    }

    fun getClusterLeaves(featureJSON: String, number: Int, offset: Int, promise: Promise) {
        val feature = Feature.fromJson(featureJSON)

        val _this = this
        mMap!!.getGeoJsonClusterLeaves(iD!!, feature, number.toLong(), offset.toLong(), QueryFeatureExtensionCallback { features ->
            if (features.isValue) {
                val leaves = features.value!!
                    .featureCollection
                val payload: WritableMap = WritableNativeMap()
                payload.putString(
                    "data",
                    FeatureCollection.fromFeatures(leaves!!).toJson()
                )
                callbackSuccess(payload, promise)
            } else {
                callbackError(
                    features.error ?: "Unknown error",
                    "getClusterLeaves/getGeoJsonClusterLeaves",
                    promise
                )
                return@QueryFeatureExtensionCallback
            }
        })
    }

    fun getClusterChildren(featureJSON: String, promise: Promise) {
        val feature = Feature.fromJson(featureJSON)

        val _this = this
        mMap!!.getGeoJsonClusterChildren(iD!!, feature, QueryFeatureExtensionCallback { features ->
            if (features.isValue) {
                val children = features.value!!
                    .featureCollection
                val payload: WritableMap = WritableNativeMap()
                payload.putString(
                    "data",
                    FeatureCollection.fromFeatures(children!!).toJson()
                )
                callbackSuccess(payload, promise)
            }else {
                callbackError(
                    features.error ?: "Unknown error",
                    "getClusterLeaves/queryFeatureExtensions",
                    promise
                )
                return@QueryFeatureExtensionCallback
            }
        })
    }

    /*companion object {
        private val mImagePlaceholder: Bitmap? = null
    }*/
}
