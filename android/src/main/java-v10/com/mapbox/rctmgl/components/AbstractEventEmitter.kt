package com.mapbox.rctmgl.components

import android.app.Activity
import android.view.ViewGroup
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.events.EventDispatcher
import com.mapbox.rctmgl.events.IEvent
import javax.annotation.Nonnull

/**
 * Created by nickitaliano on 8/23/17.
 */
abstract class AbstractEventEmitter<T : ViewGroup?>(reactApplicationContext: ReactApplicationContext) :
    ViewGroupManager<T>() {
    private val mRateLimitedEvents: MutableMap<String, Long>
    private var mEventDispatcher: EventDispatcher? = null
    private val mRCTAppContext: ReactApplicationContext

    init {
        mRateLimitedEvents = HashMap()
        mRCTAppContext = reactApplicationContext
    }

    val activity : Activity?
        get() = mRCTAppContext.currentActivity

    fun handleEvent(event: IEvent) {
        val eventCacheKey = getEventCacheKey(event)

        // fail safe to protect bridge from being spammed
        if (shouldDropEvent(eventCacheKey, event)) {
            return
        }
        mRateLimitedEvents[eventCacheKey] = System.currentTimeMillis()
        mEventDispatcher!!.dispatchEvent(
            AbstractEvent(
                event.iD,
                event.key,
                event.canCoalesce(),
                event.toJSON()
            )
        )
    }

    override fun addEventEmitters(context: ThemedReactContext, view: T) {
        mEventDispatcher = context.getNativeModule(UIManagerModule::class.java)!!.eventDispatcher
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        val events = customEvents() ?: return null
        val exportedEvents: MutableMap<String, Any> = HashMap()
        for ((key, value) in events) {
            exportedEvents[key] = MapBuilder.of("registrationName", value)
        }
        return exportedEvents
    }

    abstract fun customEvents(): Map<String, String>?
    private fun shouldDropEvent(cacheKey: String, event: IEvent): Boolean {
        val lastEventTimestamp = mRateLimitedEvents[cacheKey]
        return lastEventTimestamp != null && event.timestamp - lastEventTimestamp <= BRIDGE_TIMEOUT_MS
    }

    private fun getEventCacheKey(event: IEvent): String {
        return String.format("%s-%s", event.key, event.type)
    }

    companion object {
        private const val BRIDGE_TIMEOUT_MS = 10.0
    }
}
