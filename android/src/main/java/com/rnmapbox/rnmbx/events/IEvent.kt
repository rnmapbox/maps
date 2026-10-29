package com.rnmapbox.rnmbx.events

import com.facebook.react.bridge.WritableMap

interface IEvent {
    val iD: Int
    val key: String
    val type: String?
    fun canCoalesce(): Boolean
    val payload: WritableMap
    fun toJSON(): WritableMap
}