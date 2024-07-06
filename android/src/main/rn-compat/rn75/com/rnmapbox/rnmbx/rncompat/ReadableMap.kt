package com.rnmapbox.rnmbx.rncompat.readable_map
import com.facebook.react.bridge.ReadableMap

val ReadableMap.entryIterator:  Iterator<Map. Entry<String, Any>>
    get() { return this.getEntryIterator() }