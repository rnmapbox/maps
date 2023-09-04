package com.mapbox.rctmgl.components.mapview

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.fabric.FabricUIManager
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.UIManagerType
import com.mapbox.rctmgl.NativeMapViewModuleSpec
import com.mapbox.rctmgl.utils.ConvertUtils
import com.mapbox.rctmgl.utils.ExpressionParser
import com.mapbox.rctmgl.utils.extensions.toCoordinate
import com.mapbox.rctmgl.utils.extensions.toScreenCoordinate

class NativeMapViewModule(context: ReactApplicationContext) : NativeMapViewModuleSpec(context) {
    private fun withMapViewOnUIThread(viewRef: Double?, promise: Promise, fn: (RCTMGLMapView) -> Unit) {
        if (viewRef == null) {
            return
        }

        reactApplicationContext.runOnUiQueueThread {
            val manager = UIManagerHelper.getUIManager(reactApplicationContext, UIManagerType.FABRIC) as FabricUIManager
            val view = manager.resolveView(viewRef.toInt()) as? RCTMGLMapView

            if (view != null) {
                fn(view)
            } else {
                promise.reject(Exception("cannot find map view for tag ${viewRef.toInt()}"))
            }
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

    override fun takeSnap(viewRef: Double?, writeToDisk: Boolean, promise: Promise) {
        withMapViewOnUIThread(viewRef, promise) {
            it.takeSnap(writeToDisk, createCommandResponse(promise))
        }
    }

    override fun queryTerrainElevation(
        viewRef: Double?,
        coordinates: ReadableArray,
        promise: Promise
    ) {
        withMapViewOnUIThread(viewRef, promise) {
            it.queryTerrainElevation(coordinates.getDouble(0), coordinates.getDouble(1), createCommandResponse(promise))
        }
    }

    override fun setSourceVisibility(
        viewRef: Double?,
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

    override fun getCenter(viewRef: Double?, promise: Promise) {
        withMapViewOnUIThread(viewRef, promise) {
            it.getCenter(createCommandResponse(promise))
        }
    }

    override fun getCoordinateFromView(
        viewRef: Double?,
        atPoint: ReadableArray,
        promise: Promise
    ) {
        withMapViewOnUIThread(viewRef, promise) {
            it.getCoordinateFromView(atPoint.toScreenCoordinate(), createCommandResponse(promise))
        }
    }

    override fun getPointInView(viewRef: Double?, atCoordinate: ReadableArray, promise: Promise) {
        withMapViewOnUIThread(viewRef, promise) {
            it.getPointInView(atCoordinate.toCoordinate(), createCommandResponse(promise))
        }
    }

    override fun getZoom(viewRef: Double?, promise: Promise) {
        withMapViewOnUIThread(viewRef, promise) {
            it.getZoom(createCommandResponse(promise))
        }
    }

    override fun getVisibleBounds(viewRef: Double?, promise: Promise) {
        withMapViewOnUIThread(viewRef, promise) {
            it.getVisibleBounds(createCommandResponse(promise))
        }
    }

    override fun queryRenderedFeaturesAtPoint(
        viewRef: Double?,
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
        viewRef: Double?,
        withBBox: ReadableArray,
        withFilter: ReadableArray,
        withLayerIDs: ReadableArray,
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
        viewRef: Double?,
        events: ReadableArray,
        promise: Promise
    ) {
        withMapViewOnUIThread(viewRef, promise) {
            it.setHandledMapChangedEvents(events.asArrayString())
            promise.resolve(null)
        }
    }

    override fun clearData(viewRef: Double?, promise: Promise) {
        withMapViewOnUIThread(viewRef, promise) {
            it.clearData(createCommandResponse(promise))
        }
    }

    override fun querySourceFeatures(
        viewRef: Double?,
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
        const val NAME = "MBXMapViewModule"
    }
}