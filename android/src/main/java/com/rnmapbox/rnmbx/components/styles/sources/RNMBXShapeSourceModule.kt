package com.rnmapbox.rnmbx.components.styles.sources

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.mapbox.geojson.Feature
import com.mapbox.geojson.FeatureCollection
import com.rnmapbox.rnmbx.NativeRNMBXShapeSourceModuleSpec
import com.rnmapbox.rnmbx.utils.ViewRefTag
import com.rnmapbox.rnmbx.utils.ViewTagResolver

@ReactModule(name = RNMBXShapeSourceModule.NAME)
class RNMBXShapeSourceModule(reactContext: ReactApplicationContext?, private val viewTagResolver: ViewTagResolver) :
    NativeRNMBXShapeSourceModuleSpec(reactContext) {


    private fun withShapeSourceOnUIThread(viewRef: ViewRefTag?, reject: Promise, fn: (RNMBXShapeSource) -> Unit) {
        if (viewRef == null) {
            reject.reject(Exception("viewRef is null for RNMBXShapeSource"))
        } else {
            viewTagResolver.withViewResolved(viewRef.toInt(), reject, fn)
        }
    }

    companion object {
        const val NAME = "RNMBXShapeSourceModule"
    }

    @ReactMethod
    override fun getClusterExpansionZoom(
        viewRef: ViewRefTag?,
        featureJSON: String,
        promise: Promise
    ) {
        withShapeSourceOnUIThread(viewRef, promise) {
            it.getClusterExpansionZoom(featureJSON, promise)
        }
    }

    @ReactMethod
    override fun getClusterLeaves(
        viewRef: ViewRefTag?,
        featureJSON: String,
        number: Double,
        offset: Double,
        promise: Promise
    ) {
        withShapeSourceOnUIThread(viewRef, promise) {
            it.getClusterLeaves(featureJSON, number.toInt(), offset.toInt(), promise)
        }
    }

    @ReactMethod
    override fun getClusterChildren(viewRef: ViewRefTag?, featureJSON: String, promise: Promise) {
        withShapeSourceOnUIThread(viewRef, promise) {
            it.getClusterChildren(featureJSON, promise)
        }
    }

    private fun withParsedFeatures(featuresJSON: String, promise: Promise, fn: (List<Feature>) -> Unit) {
        val features = try {
            FeatureCollection.fromJson(featuresJSON).features() ?: listOf()
        } catch (e: RuntimeException) {
            promise.reject(e)
            return
        }
        fn(features)
    }

    private fun toFeatureIds(featureIds: ReadableArray): List<String> =
        featureIds.toArrayList().map { it as String }

    @ReactMethod
    override fun addFeatures(
        viewRef: ViewRefTag?,
        featuresJSON: String,
        featureIds: ReadableArray,
        shapeRevision: Double,
        promise: Promise
    ) {
        val ids = toFeatureIds(featureIds)
        withParsedFeatures(featuresJSON, promise) { features ->
            withShapeSourceOnUIThread(viewRef, promise) {
                it.addFeatures(features, ids, shapeRevision.toInt(), promise)
            }
        }
    }

    @ReactMethod
    override fun updateFeatures(
        viewRef: ViewRefTag?,
        featuresJSON: String,
        featureIds: ReadableArray,
        shapeRevision: Double,
        promise: Promise
    ) {
        val ids = toFeatureIds(featureIds)
        withParsedFeatures(featuresJSON, promise) { features ->
            withShapeSourceOnUIThread(viewRef, promise) {
                it.updateFeatures(features, ids, shapeRevision.toInt(), promise)
            }
        }
    }

    @ReactMethod
    override fun removeFeatures(
        viewRef: ViewRefTag?,
        featureIds: ReadableArray,
        shapeRevision: Double,
        promise: Promise
    ) {
        val ids = toFeatureIds(featureIds)
        withShapeSourceOnUIThread(viewRef, promise) {
            it.removeFeatures(ids, shapeRevision.toInt(), promise)
        }
    }
}
