package com.rnmapbox.rnmbx.events

import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

abstract class AbstractEvent(view: View?, private val mEventType: String) : IEvent {
    private var mTagID = 0
    private val mTimestamp: Long

    constructor(eventType: String) : this(null, eventType) {}

    init {
        if (view != null) {
            mTagID = view.id
        }
        mTimestamp = System.currentTimeMillis()
    }

    override val iD
        get() = mTagID

    override val type
        get() = mEventType

    override fun equals(event: IEvent): Boolean {
        return key == event.key && mEventType == event.type
    }

    override val payload
        get() = Arguments.createMap()

    override val timestamp
        get() = mTimestamp

    override fun toJSON(): WritableMap {
        val map = Arguments.createMap()
        map.putString("type", type)
        val payloadClone = Arguments.createMap()
        payloadClone.merge(payload)
        map.putMap("payload", payloadClone)
        return map
    }

    override fun canCoalesce(): Boolean {
        // default behavior of com.facebook.react.uimanager.events.Event
        return true
    }
}