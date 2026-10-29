package com.rnmapbox.rnmbx.components

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.uimanager.events.RCTModernEventEmitter

class AbstractEvent(
    viewId: Int,
    private val mEventName: String,
    private val mCanCoalesce: Boolean,
    private val mEvent: WritableMap?
) : Event<AbstractEvent>(viewId) {
    override fun getEventName(): String {
        return mEventName
    }

    override fun dispatch(rctEventEmitter: RCTEventEmitter) {
        rctEventEmitter.receiveEvent(viewTag, eventName, mEvent)
    }

    // The default dispatchModern() uses dispatch() for surfaceId -1, which Fabric never coalesces.
    override fun dispatchModern(rctEventEmitter: RCTModernEventEmitter) {
        rctEventEmitter.receiveEvent(
            surfaceId,
            viewTag,
            eventName,
            canCoalesce(),
            getCoalescingKey().toInt(),
            mEvent,
            getEventCategory()
        )
    }

    override fun canCoalesce(): Boolean {
        return mCanCoalesce
    }
}
