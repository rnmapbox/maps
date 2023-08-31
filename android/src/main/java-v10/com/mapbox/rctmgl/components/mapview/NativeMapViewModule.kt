package com.mapbox.rctmgl.components.mapview

import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.fabric.FabricUIManager
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.UIManagerType
import com.mapbox.rctmgl.NativeMapViewModuleSpec
import com.mapbox.rctmgl.utils.ConvertUtils
import com.mapbox.rctmgl.utils.ExpressionParser
import com.mapbox.rctmgl.utils.extensions.toCoordinate
import com.mapbox.rctmgl.utils.extensions.toScreenCoordinate

class NativeMapViewModule(context: ReactApplicationContext) : NativeMapViewModuleSpec(context) {
    private fun withMapViewManagerOnUIThread(viewRef: Double?, fn: (RCTMGLMapView) -> Unit) {
        if (viewRef == null) {
            return
        }

        // returns null when called too early :/, maybe fixable
//        val manager = UIManagerHelper.getUIManager(reactApplicationContext, UIManagerType.FABRIC) as FabricUIManager
//        val view = manager.resolveView(viewRef.toInt())

        reactApplicationContext.runOnUiQueueThread {
            val viewManagers =
                (reactApplicationContext.applicationContext as ReactApplication)
                    .reactNativeHost
                    .reactInstanceManager
                    .getOrCreateViewManagers(reactApplicationContext)
                    .filterIsInstance<RCTMGLMapViewManager>()

            for (viewManager in viewManagers) {
                val view = viewManager.getByReactTag(viewRef.toInt()) ?: continue

                fn(view)
                break
            }
        }
    }

    override fun takeSnap(viewRef: Double?, writeToDisk: Boolean, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef) {
            // TODO: callbackID
            it.takeSnap("", writeToDisk)

            promise.resolve(null)
        }
    }

    override fun queryTerrainElevation(
        viewRef: Double?,
        coordinates: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef) {
            // TODO: callbackID
            it.queryTerrainElevation("", coordinates.getDouble(0), coordinates.getDouble(1))

            promise.resolve(null)
        }
    }

    override fun setSourceVisibility(
        viewRef: Double?,
        visible: Boolean,
        sourceId: String,
        sourceLayerId: String?,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef) {
            it.setSourceVisibility(visible, sourceId, sourceLayerId)

            promise.resolve(null)
        }
    }

    override fun getCenter(viewRef: Double?, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef) {
            // TODO: callbackID
            it.getCenter("")

            promise.resolve(null)
        }
    }

    override fun getCoordinateFromView(
        viewRef: Double?,
        atPoint: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef) {
            // TODO: callbackID
            it.getCoordinateFromView("", atPoint.toScreenCoordinate())

            promise.resolve(null)
        }
    }

    override fun getPointInView(viewRef: Double?, atCoordinate: ReadableArray, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef) {
            // TODO: callbackID
            it.getPointInView("", atCoordinate.toCoordinate())

            promise.resolve(null)
        }
    }

    override fun getZoom(viewRef: Double?, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef) {
            // TODO: callbackID
            it.getZoom("")

            promise.resolve(null)
        }
    }

    override fun getVisibleBounds(viewRef: Double?, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef) {
            // TODO: callbackID
            it.getVisibleBounds("")

            promise.resolve(null)
        }
    }

    override fun queryRenderedFeaturesAtPoint(
        viewRef: Double?,
        atPoint: ReadableArray,
        withFilter: ReadableArray,
        withLayerIDs: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef) {
            // TODO: callbackID
            val layerIds = ConvertUtils.toStringList(withLayerIDs)
            it.queryRenderedFeaturesAtPoint(
                "",
                ConvertUtils.toPointF(atPoint),
                ExpressionParser.from(withFilter),
                if (layerIds.size == 0) null else layerIds
            )

            promise.resolve(null)
        }
    }

    override fun queryRenderedFeaturesInRect(
        viewRef: Double?,
        withBBox: ReadableArray,
        withFilter: ReadableArray,
        withLayerIDs: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef) {
            // TODO: callbackID
            val layerIds = ConvertUtils.toStringList(withLayerIDs)
            it.queryRenderedFeaturesInRect(
                "",
                ConvertUtils.toRectF(withBBox),
                ExpressionParser.from(withFilter),
                if (layerIds.size == 0) null else layerIds
            )

            promise.resolve(null)
        }
    }

    override fun setHandledMapChangedEvents(
        viewRef: Double?,
        events: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef) {
            it.setHandledMapChangedEvents(events?.asArrayString() ?: emptyArray())
            promise.resolve(null)
        }
    }

    override fun clearData(viewRef: Double?, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef) {
            // TODO: callbackID
            it.clearData("")
            promise.resolve(null)
        }
    }

    companion object {
        const val NAME = "MBXMapViewModule"
    }
}