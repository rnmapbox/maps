package com.rnmapbox.rnmbx.events

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableType
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXCameraGestureObserverManagerDelegate
import com.facebook.react.viewmanagers.RNMBXCameraGestureObserverManagerInterface
import com.rnmapbox.rnmbx.components.AbstractEventEmitter
import com.rnmapbox.rnmbx.rncompat.dynamic.getType
import com.rnmapbox.rnmbx.utils.Logger

@ReactModule(name = RNMBXCameraGestureObserverManager.REACT_CLASS)
class RNMBXCameraGestureObserverManager(private val mContext: ReactApplicationContext) :
    AbstractEventEmitter<RNMBXCameraGestureObserver>(mContext),
    RNMBXCameraGestureObserverManagerInterface<RNMBXCameraGestureObserver> {

    private val delegate: RNMBXCameraGestureObserverManagerDelegate<RNMBXCameraGestureObserver, RNMBXCameraGestureObserverManager> =
        RNMBXCameraGestureObserverManagerDelegate(this)

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXCameraGestureObserver =
        RNMBXCameraGestureObserver(reactContext, this)

    @ReactProp(name = "quietPeriodMs")
    override fun setQuietPeriodMs(view: RNMBXCameraGestureObserver?, value: Dynamic?) {
        value?.let {
            when (it.getType()) {
                ReadableType.Number -> view?.quietPeriodMs = it.asDouble()
                ReadableType.Null -> view?.quietPeriodMs = null
                else -> Logger.e(REACT_CLASS, "Expected Number or null for quietPeriodMs")
            }
        }
    }

    @ReactProp(name = "maxIntervalMs")
    override fun setMaxIntervalMs(view: RNMBXCameraGestureObserver?, value: Dynamic?) {
        value?.let {
            when (it.getType()) {
                ReadableType.Number -> view?.maxIntervalMs = it.asDouble()
                ReadableType.Null -> view?.maxIntervalMs = null
                else -> Logger.e(REACT_CLASS, "Expected Number or null for maxIntervalMs")
            }
        }
    }

    @ReactProp(name = "hasOnMapSteady")
    override fun setHasOnMapSteady(view: RNMBXCameraGestureObserver?, value: Dynamic?) {
        if (value?.getType()?.name == "Boolean") {
            view?.hasOnMapSteady = value.asBoolean()
        } else {
            if (value == null) {
                Logger.e(REACT_CLASS, "Expected Boolean value for hasOnMapSteady")
            } else {
                Logger.e(REACT_CLASS, "Expected Boolean value for hasOnMapSteady, got ${value.getType()?.name}")
            }
        }
    }

    override fun getDelegate(): ViewManagerDelegate<RNMBXCameraGestureObserver> = delegate

    // Map the native event name to the JS registration name for direct events
    override fun customEvents(): Map<String, String> = mapOf(
        "onMapSteady" to "onMapSteady"
    )

    companion object {
        const val REACT_CLASS = "RNMBXCameraGestureObserver"
    }
}
