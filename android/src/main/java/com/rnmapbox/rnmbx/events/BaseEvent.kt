package com.rnmapbox.rnmbx.events

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

class BaseEvent(
    private val surfaceId: Int,
    private val viewTag: Int,
    private val eventName: String,
    private val eventData: WritableMap,
    private val canCoalesce: Boolean = false
): Event<BaseEvent>(surfaceId, viewTag) {
    override fun getEventName(): String {
        return eventName
    }

    override fun canCoalesce(): Boolean {
        return canCoalesce
    }

    override fun getEventData(): WritableMap? {
        return eventData
    }
}