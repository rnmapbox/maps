package com.rnmapbox.rnmbx.events

import com.facebook.react.bridge.WritableMap

/**
 * Created by nickitaliano on 8/23/17.
 */
interface IEvent {
    val iD: Int
    val key: String?
    val type: String?
    val timestamp: Long
    fun equals(event: IEvent): Boolean
    fun canCoalesce(): Boolean
    val payload: WritableMap
    fun toJSON(): WritableMap
}