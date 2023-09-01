package com.mapbox.rctmgl.components.mapview

import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
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

    override fun takeSnap(viewRef: Double?, command: String, writeToDisk: Boolean, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef) {
            it.takeSnap(command, writeToDisk)

            promise.resolve(null)
        }
    }

    override fun queryTerrainElevation(
        viewRef: Double?,
        command: String,
        coordinates: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef) {
            it.queryTerrainElevation(command, coordinates.getDouble(0), coordinates.getDouble(1))

            promise.resolve(null)
        }
    }

    override fun setSourceVisibility(
        viewRef: Double?,
        command: String,
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

    override fun getCenter(viewRef: Double?, command: String, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef) {
            it.getCenter(command)

            promise.resolve(null)
        }
    }

    override fun getCoordinateFromView(
        viewRef: Double?,
        command: String,
        atPoint: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef) {
            it.getCoordinateFromView(command, atPoint.toScreenCoordinate())

            promise.resolve(null)
        }
    }

    override fun getPointInView(viewRef: Double?, command: String, atCoordinate: ReadableArray, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef) {
            it.getPointInView(command, atCoordinate.toCoordinate())

            promise.resolve(null)
        }
    }

    override fun getZoom(viewRef: Double?, command: String, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef) {
            it.getZoom(command)

            promise.resolve(null)
        }
    }

    override fun getVisibleBounds(viewRef: Double?, command: String, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef) {
            it.getVisibleBounds(command)

            promise.resolve(null)
        }
    }

    override fun queryRenderedFeaturesAtPoint(
        viewRef: Double?,
        command: String,
        atPoint: ReadableArray,
        withFilter: ReadableArray,
        withLayerIDs: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef) {
            val layerIds = ConvertUtils.toStringList(withLayerIDs)
            it.queryRenderedFeaturesAtPoint(
                command,
                ConvertUtils.toPointF(atPoint),
                ExpressionParser.from(withFilter),
                if (layerIds.size == 0) null else layerIds
            )

            promise.resolve(null)
        }
    }

    override fun queryRenderedFeaturesInRect(
        viewRef: Double?,
        command: String,
        withBBox: ReadableArray,
        withFilter: ReadableArray,
        withLayerIDs: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef) {
            val layerIds = ConvertUtils.toStringList(withLayerIDs)
            it.queryRenderedFeaturesInRect(
                command,
                ConvertUtils.toRectF(withBBox),
                ExpressionParser.from(withFilter),
                if (layerIds.size == 0) null else layerIds
            )

            promise.resolve(null)
        }
    }

    override fun setHandledMapChangedEvents(
        viewRef: Double?,
        command: String,
        events: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef) {
            it.setHandledMapChangedEvents(events.asArrayString() ?: emptyArray())
            promise.resolve(null)
        }
    }

    override fun clearData(viewRef: Double?, command: String, promise: Promise) {
        withMapViewManagerOnUIThread(viewRef) {
            it.clearData(command)
            promise.resolve(null)
        }
    }

    override fun querySourceFeatures(
        viewRef: Double?,
        command: String,
        withFilter: ReadableArray,
        withSourceLayerIDs: ReadableArray,
        promise: Promise
    ) {
        withMapViewManagerOnUIThread(viewRef) {
            it.querySourceFeatures(
                command,
                ExpressionParser.from(withFilter),
                if (withSourceLayerIDs.size == 0) null else withSourceLayerIDs
            )
            promise.resolve(null)
        }
    }

    companion object {
        const val NAME = "MBXMapViewModule"
    }
}