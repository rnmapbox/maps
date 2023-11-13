package com.rnmapbox.rnmbx.events

import com.facebook.react.bridge.WritableMap

interface IEvent {
    val iD: Int
    val key: String
    val type: String?
    val timestamp: Long
    fun equals(event: IEvent): Boolean
    fun canCoalesce(): Boolean
    val payload: WritableMap
    fun toJSON(): WritableMap
}