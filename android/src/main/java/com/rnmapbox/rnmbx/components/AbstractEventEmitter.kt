package com.rnmapbox.rnmbx.components

import android.app.Activity
import android.view.ViewGroup
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.EventDispatcher
import com.rnmapbox.rnmbx.events.IEvent
import com.rnmapbox.rnmbx.utils.Logger

/**
 * Created by nickitaliano on 8/23/17.
 */
abstract class AbstractEventEmitter<T : ViewGroup>(reactApplicationContext: ReactApplicationContext) :
    ViewGroupManager<T>() {
    private var mEventDispatcher: EventDispatcher? = null
    private val mRCTAppContext: ReactApplicationContext

    init {
        mRCTAppContext = reactApplicationContext
    }

    val activity : Activity?
        get() = mRCTAppContext.currentActivity

    fun <T : Event<T>>dispatchEvent(event: Event<T>) {
        mEventDispatcher!!.dispatchEvent(event)
    }

    fun handleEvent(event: IEvent) {
        try {
            mEventDispatcher!!.dispatchEvent(
                AbstractEvent(
                    event.iD,
                    event.key,
                    event.canCoalesce(),
                    event.toJSON()
                )
            )
        } catch (e: Exception) {
            Logger.e("Error dispatching event:", e.toString())
        }
    }

    override fun addEventEmitters(context: ThemedReactContext, view: T) {
        mEventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(context, view.id)
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
}
