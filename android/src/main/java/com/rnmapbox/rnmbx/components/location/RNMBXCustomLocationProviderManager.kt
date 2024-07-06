package com.rnmapbox.rnmbx.components.location

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReadableType
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXCustomLocationProviderManagerInterface
import com.rnmapbox.rnmbx.rncompat.dynamic.*
import com.rnmapbox.rnmbx.utils.Logger


class RNMBXCustomLocationProviderManager : ViewGroupManager<RNMBXCustomLocationProvider>(),
    RNMBXCustomLocationProviderManagerInterface<RNMBXCustomLocationProvider> {
    override fun getName(): String {
        return  REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXCustomLocationProvider {
        return RNMBXCustomLocationProvider(reactContext);
    }

    @ReactProp(name = "coordinate")
    override fun setCoordinate(view: RNMBXCustomLocationProvider, value: Dynamic?) {
        if (value?.type == ReadableType.Array) {
            val array = value.asArray()
            if (array.size() == 2 && array.getType(0) == ReadableType.Number && array.getType(1) == ReadableType.Number) {
                view.coordinate = Pair(array.getDouble(0), array.getDouble(1))
            } else {
                Logger.e(LOG_TAG, "coordinate is expected to be an array of numbers with 2 elements")
            }
        } else {
            Logger.e(LOG_TAG, "coordinate is expected to be an array of numbers with 2 elements")
        }
    }

    @ReactProp(name = "heading")
    override fun setHeading(view: RNMBXCustomLocationProvider, value: Dynamic?) {
        if (value?.type == ReadableType.Number) {
            view.heading = value.asDouble()
        } else {
            Logger.e(LOG_TAG, "heading is expected to be a number")
        }
    }

    override fun onAfterUpdateTransaction(view: RNMBXCustomLocationProvider) {
        super.onAfterUpdateTransaction(view)

        view.applyAllChanges()
    }

    companion object {
        const val REACT_CLASS = "RNMBXCustomLocationProvider"
        const val LOG_TAG = REACT_CLASS
    }
}