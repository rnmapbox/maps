package com.mapbox.rctmgl.components.mapview

import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
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
    private fun withMapViewManagerOnUIThread(viewRef: Double?, promise: Promise, fn: (RCTMGLMapView) -> Unit) {
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

    private fun Promise.resolveOrReject(data: ReadableMap?) {
        if (data != null && data.hasKey("error")) {
            this.reject(Exception(data.getString("error")))
        } else {
            this.resolve(data)
        }
    }

    override fun takeSnap(viewRef: Double?, writeToDisk: Boolean, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef, promise) {
            it.takeSnap(writeToDisk) { fillData ->
                with(WritableNativeMap()) {
                    fillData(this)
                    promise.resolveOrReject(this)
                }
            }
        }
    }

    override fun queryTerrainElevation(
        viewRef: Double?,
        coordinates: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef, promise) {
            it.queryTerrainElevation(coordinates.getDouble(0), coordinates.getDouble(1)) { fillData ->
                with(WritableNativeMap()) {
                    fillData(this)
                    promise.resolveOrReject(this)
                }
            }
        }
    }

    override fun setSourceVisibility(
        viewRef: Double?,
        visible: Boolean,
        sourceId: String,
        sourceLayerId: String?,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef, promise) {
            it.setSourceVisibility(visible, sourceId, sourceLayerId)

            promise.resolveOrReject(null)
        }
    }

    override fun getCenter(viewRef: Double?, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef, promise) {
            it.getCenter { fillData ->
                with(WritableNativeMap()) {
                    fillData(this)

                    promise.resolveOrReject(this)
                }
            }
        }
    }

    override fun getCoordinateFromView(
        viewRef: Double?,
        atPoint: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef, promise) {
            it.getCoordinateFromView(atPoint.toScreenCoordinate()) { fillData ->
                with(WritableNativeMap()) {
                    fillData(this)
                    promise.resolveOrReject(this)
                }
            }
        }
    }

    override fun getPointInView(viewRef: Double?, atCoordinate: ReadableArray, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef, promise) {
            it.getPointInView(atCoordinate.toCoordinate()) { fillData ->
                with(WritableNativeMap()) {
                    fillData(this)
                    promise.resolveOrReject(this)
                }
            }
        }
    }

    override fun getZoom(viewRef: Double?, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef, promise) {
            it.getZoom { fillData ->
                with(WritableNativeMap()) {
                    fillData(this)
                    promise.resolveOrReject(this)
                }
            }
        }
    }

    override fun getVisibleBounds(viewRef: Double?, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef, promise) {
            it.getVisibleBounds { fillData ->
                with(WritableNativeMap()) {
                    fillData(this)
                    promise.resolveOrReject(this)
                }
            }
        }
    }

    override fun queryRenderedFeaturesAtPoint(
        viewRef: Double?,
        atPoint: ReadableArray,
        withFilter: ReadableArray,
        withLayerIDs: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef, promise) {
            val layerIds = ConvertUtils.toStringList(withLayerIDs)

            it.queryRenderedFeaturesAtPoint(
                ConvertUtils.toPointF(atPoint),
                ExpressionParser.from(withFilter),
                if (layerIds.size == 0) null else layerIds
            ) { fillData ->
                with(WritableNativeMap()) {
                    fillData(this)
                    promise.resolveOrReject(this)
                }
            }
        }
    }

    override fun queryRenderedFeaturesInRect(
        viewRef: Double?,
        withBBox: ReadableArray,
        withFilter: ReadableArray,
        withLayerIDs: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef, promise) {
            val layerIds = ConvertUtils.toStringList(withLayerIDs)

            it.queryRenderedFeaturesInRect(
                ConvertUtils.toRectF(withBBox),
                ExpressionParser.from(withFilter),
                if (layerIds.size == 0) null else layerIds
            ) { fillData ->
                with(WritableNativeMap()) {
                    fillData(this)
                    promise.resolveOrReject(this)
                }
            }
        }
    }

    override fun setHandledMapChangedEvents(
        viewRef: Double?,
        events: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef, promise) {
            it.setHandledMapChangedEvents(events.asArrayString())
            promise.resolveOrReject(null)
        }
    }

    override fun clearData(viewRef: Double?, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef, promise) {
            it.clearData { fillData ->
                with(WritableNativeMap()) {
                    fillData(this)
                    promise.resolveOrReject(this)
                }
            }
        }
    }

    override fun querySourceFeatures(
        viewRef: Double?,
        withFilter: ReadableArray,
        withSourceLayerIDs: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef) {
            it.querySourceFeatures(
                ExpressionParser.from(withFilter),
                if (withSourceLayerIDs.size == 0) null else withSourceLayerIDs
            ) { fillData ->
                with(WritableNativeMap()) {
                    fillData(this)
                    promise.resolve(this)
                }
            }
        }
    }

    companion object {
        const val NAME = "MBXMapViewModule"
    }
}