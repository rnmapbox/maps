package com.rnmapbox.rnmbx.events

import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

abstract class AbstractEvent(view: View?, private val mEventType: String) : IEvent {
    private var mTagID = 0

    constructor(eventType: String) : this(null, eventType) {}

    init {
        if (view != null) {
            mTagID = view.id
        }
    }

    override val iD
        get() = mTagID

    override val type
        get() = mEventType

    override val payload
        get() = Arguments.createMap()

    override fun toJSON(): WritableMap {
        val map = Arguments.createMap()
        map.putString("type", type)
        val payloadClone = Arguments.createMap()
        payloadClone.merge(payload)
        map.putMap("payload", payloadClone)
        return map
    }

    override fun canCoalesce(): Boolean {
        // Every event reaches JS, unless an event that only carries the latest state opts in
        return false
    }
}