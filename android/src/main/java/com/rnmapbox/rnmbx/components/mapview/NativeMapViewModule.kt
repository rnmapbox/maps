package com.rnmapbox.rnmbx.components.mapview

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.rnmapbox.rnmbx.NativeMapViewModuleSpec
import com.rnmapbox.rnmbx.utils.ConvertUtils
import com.rnmapbox.rnmbx.utils.ExpressionParser
import com.rnmapbox.rnmbx.utils.ViewRefTag
import com.rnmapbox.rnmbx.utils.ViewTagResolver
import com.rnmapbox.rnmbx.utils.extensions.toCoordinate
import com.rnmapbox.rnmbx.utils.extensions.toScreenCoordinate

class NativeMapViewModule(context: ReactApplicationContext, val viewTagResolver: ViewTagResolver) : NativeMapViewModuleSpec(context) {
    private fun withMapViewOnUIThread(
        viewRef: ViewRefTag?,
        reject: Promise,
        fn: (RNMBXMapView) -> Unit
    ) {
        if (viewRef == null) {
            reject.reject(Exception("viewRef is null"))
        } else {
            viewTagResolver.withViewResolved(viewRef.toInt(), reject, fn)
        }
    }

    private fun createCommandResponse(promise: Promise): CommandResponse = object : CommandResponse {
        override fun success(builder: (WritableMap) -> Unit) {
            val payload: WritableMap = WritableNativeMap()
            builder(payload)

            promise.resolve(payload)
        }

        override fun error(message: String) {
            promise.reject(Exception(message))
        }
    }

    override fun takeSnap(viewRef: ViewRefTag?, writeToDisk: Boolean, promise: Promise) {
        withMapViewOnUIThread(viewRef, promise) {
            it.takeSnap(writeToDisk, createCommandResponse(promise))
        }
    }

    override fun queryTerrainElevation(
        viewRef: ViewRefTag?,
        coordinates: ReadableArray,
        promise: Promise
    ) {
        withMapViewOnUIThread(viewRef, promise) {
            it.queryTerrainElevation(coordinates.getDouble(0), coordinates.getDouble(1), createCommandResponse(promise))
        }
    }

    override fun setSourceVisibility(
        viewRef: ViewRefTag?,
        visible: Boolean,
        sourceId: String,
        sourceLayerId: String?,
        promise: Promise
    ) {
        withMapViewOnUIThread(viewRef, promise) {
            it.setSourceVisibility(visible, sourceId, sourceLayerId)

            promise.resolve(null)
        }
    }

    override fun getCenter(viewRef: ViewRefTag?, promise: Promise) {
        withMapViewOnUIThread(viewRef, promise) {
            it.getCenter(createCommandResponse(promise))
        }
    }

    override fun getCoordinateFromView(
        viewRef: ViewRefTag?,
        atPoint: ReadableArray,
        promise: Promise
    ) {
        withMapViewOnUIThread(viewRef, promise) {
            it.getCoordinateFromView(atPoint.toScreenCoordinate(), createCommandResponse(promise))
        }
    }

    override fun getPointInView(viewRef: ViewRefTag?, atCoordinate: ReadableArray, promise: Promise) {
        withMapViewOnUIThread(viewRef, promise) {
            it.getPointInView(atCoordinate.toCoordinate(), createCommandResponse(promise))
        }
    }

    override fun getZoom(viewRef: ViewRefTag?, promise: Promise) {
        withMapViewOnUIThread(viewRef, promise) {
            it.getZoom(createCommandResponse(promise))
        }
    }

    override fun getVisibleBounds(viewRef: ViewRefTag?, promise: Promise) {
        withMapViewOnUIThread(viewRef, promise) {
            it.getVisibleBounds(createCommandResponse(promise))
        }
    }

    override fun queryRenderedFeaturesAtPoint(
        viewRef: ViewRefTag?,
        atPoint: ReadableArray,
        withFilter: ReadableArray,
        withLayerIDs: ReadableArray,
        promise: Promise
    ) {
        withMapViewOnUIThread(viewRef, promise) {
            val layerIds = ConvertUtils.toStringList(withLayerIDs)

            it.queryRenderedFeaturesAtPoint(
                ConvertUtils.toPointF(atPoint),
                ExpressionParser.from(withFilter),
                if (layerIds.size == 0) null else layerIds,
                createCommandResponse(promise)
            )
        }
    }

    override fun queryRenderedFeaturesInRect(
        viewRef: ViewRefTag?,
        withBBox: ReadableArray,
        withFilter: ReadableArray,
        withLayerIDs: ReadableArray?,
        promise: Promise
    ) {
        withMapViewOnUIThread(viewRef, promise) {
            val layerIds = ConvertUtils.toStringList(withLayerIDs)

            it.queryRenderedFeaturesInRect(
                ConvertUtils.toRectF(withBBox),
                ExpressionParser.from(withFilter),
                if (layerIds.size == 0) null else layerIds,
                createCommandResponse(promise)
            )
        }
    }

    override fun setHandledMapChangedEvents(
        viewRef: ViewRefTag?,
        events: ReadableArray?,
        promise: Promise?
    ) {
        withMapViewOnUIThread(viewRef, promise!!) {
            it.setHandledMapChangedEvents(events!!.asArrayString())
            promise.resolve(null)
        }
    }

    override fun clearData(viewRef: ViewRefTag?, promise: Promise) {
        withMapViewOnUIThread(viewRef, promise) {
            it.clearData(createCommandResponse(promise))
        }
    }

    override fun querySourceFeatures(
        viewRef: ViewRefTag?,
        sourceId: String,
        withFilter: ReadableArray,
        withSourceLayerIDs: ReadableArray,
        promise: Promise
    ) {
        withMapViewOnUIThread(viewRef, promise) {
            val sourceLayerIds = ConvertUtils.toStringList(withSourceLayerIDs)

            it.querySourceFeatures(
                sourceId,
                ExpressionParser.from(withFilter),
                if (sourceLayerIds.size == 0) null else sourceLayerIds,
                createCommandResponse(promise)
            )
        }
    }

    companion object {
        const val NAME = "RNMBXMapViewModule"
    }
}