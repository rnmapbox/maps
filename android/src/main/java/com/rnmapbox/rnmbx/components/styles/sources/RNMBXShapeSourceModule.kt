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

    private fun parseFeatures(featuresJSON: String, promise: Promise): List<Feature>? =
        try {
            FeatureCollection.fromJson(featuresJSON).features() ?: listOf()
        } catch (e: RuntimeException) {
            promise.reject(e)
            null
        }

    @ReactMethod
    override fun addFeatures(viewRef: ViewRefTag?, featuresJSON: String, promise: Promise) {
        val features = parseFeatures(featuresJSON, promise) ?: return
        withShapeSourceOnUIThread(viewRef, promise) {
            it.addFeatures(features, promise)
        }
    }

    @ReactMethod
    override fun updateFeatures(viewRef: ViewRefTag?, featuresJSON: String, promise: Promise) {
        val features = parseFeatures(featuresJSON, promise) ?: return
        withShapeSourceOnUIThread(viewRef, promise) {
            it.updateFeatures(features, promise)
        }
    }

    @ReactMethod
    override fun removeFeatures(viewRef: ViewRefTag?, featureIds: ReadableArray, promise: Promise) {
        val ids = featureIds.toArrayList().map { it as String }
        withShapeSourceOnUIThread(viewRef, promise) {
            it.removeFeatures(ids, promise)
        }
    }
}
