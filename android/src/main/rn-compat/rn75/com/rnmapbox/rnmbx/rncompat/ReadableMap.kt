package com.rnmapbox.rnmbx.rncompat.readable_map
import com.facebook.react.bridge.ReadableMap

fun ReadableMap.getEntryIterator():  Iterator<Map. Entry<String, Any>>
{
    return this.entryIterator
}